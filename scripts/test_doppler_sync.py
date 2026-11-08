"""Tests for deploy/doppler-sync.sh.

The script runs for real (bash, git, jq) against a throwaway git repo, with
fake `doppler`, `vercel` and `curl` binaries first on PATH. The fake curl
serves a small in-memory Vercel API backed by a JSON state file and logs every
argv it receives, so the tests can prove what was written, where, and that no
secret value or token ever appears on a command line or in the output.
"""

import json
import os
import shutil
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "deploy" / "doppler-sync.sh"
TOKEN = "tok-SENTINEL-4f1c"
SECRET = "s3cr3t-VALUE-9a7e"

FAKE_CURL = r'''#!/usr/bin/env python3
import json, os, re, sys
state_path = os.environ["FAKE_VERCEL_STATE"]
with open(os.environ["FAKE_LOG"], "a") as log:
    log.write("curl " + json.dumps(sys.argv[1:]) + "\n")
args = sys.argv[1:]
url, method, headers, data = None, "GET", [], None
i = 0
while i < len(args):
    a = args[i]
    if a == "-X": method = args[i + 1]; i += 2; continue
    if a == "-H": headers.append(args[i + 1]); i += 2; continue
    if a in ("--data-binary", "--data"): data = args[i + 1]; i += 2; continue
    if a.startswith("http"): url = a
    i += 1
auth = []
for h in headers:
    if h.startswith("@"):
        with open(h[1:]) as f: auth += [l.strip() for l in f if l.strip()]
    else:
        auth.append(h)
if "Authorization: Bearer " + os.environ["EXPECT_TOKEN"] not in auth:
    sys.stderr.write("fake curl: missing auth\n"); sys.exit(22)
with open(state_path) as f: st = json.load(f)
path = url.split("://", 1)[1].split("/", 1)[1]
path = "/" + path.split("?", 1)[0]
def out(o): sys.stdout.write(json.dumps(o)); sys.exit(0)
if method == "GET" and os.environ.get("FAKE_GET_FAIL") == path.split("/")[1]: sys.exit(22)
if method == "GET" and re.fullmatch(r"/v9/projects/[^/]+/env", path):
    out({"envs": [{k: e[k] for k in ("id", "key", "type", "target", "gitBranch")} for e in st["envs"]]})
m = re.fullmatch(r"/v1/projects/[^/]+/env/([^/]+)", path)
if method == "GET" and m:
    e = next(e for e in st["envs"] if e["id"] == m.group(1))
    if e["type"] == "sensitive": out({"id": e["id"]})
    out({"id": e["id"], "value": e["value"]})
def body():
    return json.loads(sys.stdin.read() if data == "@-" else data)
def save():
    if os.environ.get("FAKE_WRITE_CORRUPT"): st["envs"][-1]["value"] = "corrupted"
    with open(state_path, "w") as f: json.dump(st, f)
def logw(kind, o):
    with open(os.environ["FAKE_LOG"], "a") as log: log.write(kind + " " + json.dumps(o) + "\n")
if method == "POST" and re.fullmatch(r"/v10/projects/[^/]+/env", path):
    if os.environ.get("FAKE_WRITE_FAIL") or "upsert" in url: sys.exit(22)
    b = body()
    logw("post", {k: b[k] for k in ("key", "type", "target")})
    if any(e["key"] == b["key"] and set(e["target"]) & set(b["target"]) for e in st["envs"]): sys.exit(22)
    st["envs"].append({"id": "env_new_" + b["key"], "key": b["key"], "type": b["type"],
                       "target": b["target"], "gitBranch": None, "value": b["value"]})
    save(); out({"created": {}})
m = re.fullmatch(r"/v9/projects/[^/]+/env/([^/]+)", path)
if method == "PATCH" and m:
    if os.environ.get("FAKE_WRITE_FAIL"): sys.exit(22)
    b = body()
    logw("patch", {"id": m.group(1), "fields": sorted(b)})
    e = next(e for e in st["envs"] if e["id"] == m.group(1))
    e["value"] = b["value"]; st["envs"].remove(e); st["envs"].append(e)
    save(); out({})
if method == "GET" and path == "/v6/deployments":
    out({"deployments": [{"uid": d} for d in st.get("deployments", [])]})
sys.stderr.write("fake curl: unexpected " + method + " " + path + "\n"); sys.exit(22)
'''

FAKE_DOPPLER = r'''#!/usr/bin/env bash
printf 'doppler %s\n' "$*" >> "$FAKE_LOG"
case "$1" in
  me) exit 0 ;;
  secrets) cat "$FAKE_DOPPLER_JSON" ;;
  *) exit 1 ;;
esac
'''

FAKE_VERCEL = r'''#!/usr/bin/env bash
printf 'vercel %s\n' "$*" >> "$FAKE_LOG"
[ "$1" = redeploy ] && [ -n "${FAKE_REDEPLOY_FAIL:-}" ] && exit 1
exit 0
'''


def entry(key, value, target=("production",), type_="encrypted", id_=None):
    return {"id": id_ or "env_" + key, "key": key, "type": type_, "target": list(target),
            "gitBranch": None, "value": value}


class DopplerSyncTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="doppler-sync-test-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.repo = self.tmp / "repo"
        (self.repo / "deploy").mkdir(parents=True)
        shutil.copy(SCRIPT, self.repo / "deploy" / "doppler-sync.sh")
        self.bin = self.tmp / "bin"
        self.bin.mkdir()
        for name, body in (("curl", FAKE_CURL), ("doppler", FAKE_DOPPLER), ("vercel", FAKE_VERCEL)):
            p = self.bin / name
            p.write_text(body)
            p.chmod(p.stat().st_mode | stat.S_IEXEC)
        self.log = self.tmp / "calls.log"
        self.log.write_text("")
        self.state = self.tmp / "vercel.json"
        self.doppler = self.tmp / "doppler.json"
        self.set_vercel([], deployments=["dpl_latest"])
        self.set_doppler({})

    def git(self, *args):
        subprocess.run(["git", "-C", str(self.repo), *args], check=True, capture_output=True,
                       env={**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@t",
                            "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@t"})

    def commit_keys(self, *keys):
        (self.repo / "deploy" / "doppler-keys.txt").write_text(
            "# managed keys\n" + "".join(k + "\n" for k in keys))
        if not (self.repo / ".git").exists():
            self.git("init", "-q")
        self.git("add", "-A")
        self.git("commit", "-q", "-m", "keys", "--allow-empty")

    def set_vercel(self, envs, deployments=("dpl_latest",)):
        self.state.write_text(json.dumps({"envs": envs, "deployments": list(deployments)}))

    def set_doppler(self, secrets):
        self.doppler.write_text(json.dumps(secrets))

    def run_sync(self, *args, **extra_env):
        env = {**os.environ, "PATH": f"{self.bin}:{os.environ['PATH']}", "VERCEL_TOKEN": TOKEN,
               "EXPECT_TOKEN": TOKEN, "FAKE_LOG": str(self.log), "FAKE_VERCEL_STATE": str(self.state),
               "FAKE_DOPPLER_JSON": str(self.doppler), **extra_env}
        r = subprocess.run(["bash", "deploy/doppler-sync.sh", *args], cwd=self.repo, env=env,
                           capture_output=True, text=True, timeout=60)
        calls = self.log.read_text()
        for blob in (r.stdout, r.stderr, calls):
            self.assertNotIn(SECRET, blob, "secret value leaked")
            self.assertNotIn(TOKEN, blob, "token leaked onto argv or output")
        return r

    def writes(self):
        return self.calls("post") + self.calls("patch")

    def calls(self, prefix):
        return [l for l in self.log.read_text().splitlines() if l.startswith(prefix + " ")]

    def vercel_value(self, key):
        return next(e["value"] for e in json.loads(self.state.read_text())["envs"] if e["key"] == key)

    # --- behaviour -------------------------------------------------------

    def test_empty_list_is_a_noop_without_network(self):
        self.commit_keys()
        for mode in ((), ("--apply",)):
            r = self.run_sync(*mode)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertIn("0 managed keys", r.stderr)
        self.assertEqual(self.log.read_text(), "")

    def test_shipped_allowlist_is_empty(self):
        keys = [l.split("#")[0].strip() for l in (ROOT / "deploy" / "doppler-keys.txt").read_text().splitlines()]
        self.assertEqual([k for k in keys if k], [])

    def test_dirty_tree_refused(self):
        self.commit_keys("SITE_FLAG")
        (self.repo / "stray.txt").write_text("x")
        r = self.run_sync()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("dirty", r.stderr)
        self.assertEqual(self.log.read_text(), "")

    def test_bad_names_refused_before_any_call(self):
        for keys, word in ((("RAILWAY_TOKEN",), "platform-reserved"), (("VERCEL_URL",), "platform-reserved"),
                           (("lower_case",), "malformed"), (("A", "A"), "duplicate")):
            with self.subTest(keys=keys):
                self.commit_keys(*keys)
                r = self.run_sync()
                self.assertNotEqual(r.returncode, 0)
                self.assertIn(word, r.stderr)
                self.assertEqual(self.log.read_text(), "")

    def test_missing_in_doppler_refused(self):
        self.commit_keys("SITE_FLAG")
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("SITE_FLAG: missing-in-doppler", r.stderr)
        self.assertEqual(self.writes(), [])

    def test_reference_value_refused(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": "${{ shared.SECRET }}"})
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("reference-value", r.stderr)
        self.assertEqual(self.writes(), [])

    def test_shared_entry_refused(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "old", target=("production", "preview"))])
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("shared-with-other-environments", r.stderr)
        self.assertEqual(self.writes(), [])

    def test_sensitive_entry_refused(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "hidden", type_="sensitive")])
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("sensitive-unreadable", r.stderr)
        self.assertEqual(self.writes(), [])

    def test_preview_entry_is_ignored_and_untouched(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "preview-only", target=("preview",), id_="env_prev"),
                         entry("SITE_FLAG", SECRET)])
        r = self.run_sync("--apply")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("in sync", r.stderr)
        envs = json.loads(self.state.read_text())["envs"]
        self.assertEqual(next(e for e in envs if e["id"] == "env_prev")["value"], "preview-only")

    def test_unchanged_writes_nothing_and_does_not_redeploy(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", SECRET)])
        r = self.run_sync("--apply")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("SITE_FLAG: unchanged", r.stderr)
        self.assertEqual(self.writes(), [])
        self.assertFalse([c for c in self.calls("vercel") if "redeploy" in c])

    def test_dry_run_reports_without_writing(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "old")])
        r = self.run_sync()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("SITE_FLAG: changed", r.stderr)
        self.assertIn("would change", r.stderr)
        self.assertEqual(self.writes(), [])
        self.assertEqual(self.vercel_value("SITE_FLAG"), "old")

    def test_apply_changed_and_new_writes_production_only_then_redeploys_once(self):
        self.commit_keys("SITE_FLAG", "NEW_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET, "NEW_FLAG": SECRET + "-2"})
        self.set_vercel([entry("SITE_FLAG", "old")])
        r = self.run_sync("--apply")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("done: production rebuilt from dpl_latest", r.stderr)
        posts = [json.loads(c[5:]) for c in self.calls("post")]
        self.assertEqual([p["key"] for p in posts], ["NEW_FLAG"])
        self.assertEqual(posts[0]["target"], ["production"])
        self.assertEqual(posts[0]["type"], "encrypted")
        patches = [json.loads(c[6:]) for c in self.calls("patch")]
        self.assertEqual(patches, [{"id": "env_SITE_FLAG", "fields": ["value"]}])
        self.assertEqual(self.vercel_value("SITE_FLAG"), SECRET)
        redeploys = [c for c in self.calls("vercel") if "redeploy" in c]
        self.assertEqual(len(redeploys), 1)
        self.assertIn("dpl_latest --target production --scope zer07labs", redeploys[0])
        # Every API call (reads and writes) carried the token in a header file.
        for c in self.calls("curl"):
            self.assertNotIn("Bearer", c)

    def test_failed_write_stops_before_redeploy(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "old")])
        r = self.run_sync("--apply", FAKE_WRITE_FAIL="1")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("updating SITE_FLAG in Vercel failed", r.stderr)
        self.assertFalse([c for c in self.calls("vercel") if "redeploy" in c])

    def test_mismatch_after_apply_does_not_redeploy(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "old")])
        r = self.run_sync("--apply", FAKE_WRITE_CORRUPT="1")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("not redeploying", r.stderr)
        self.assertFalse([c for c in self.calls("vercel") if "redeploy" in c])

    def test_no_production_deployment_is_reported_not_created(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([], deployments=())
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("no production deployment", r.stderr)
        self.assertFalse([c for c in self.calls("vercel") if "redeploy" in c])

    def test_failed_vercel_read_fails_closed(self):
        # A shared entry exists; if a failed read looked like "no entry" the
        # script would report "new" and write. It must stop instead.
        for failing in ("v9", "v1"):
            with self.subTest(failing=failing):
                self.commit_keys("SITE_FLAG")
                self.set_doppler({"SITE_FLAG": SECRET})
                self.set_vercel([entry("SITE_FLAG", "old", target=("production", "preview"))])
                for mode in ((), ("--apply",)):
                    r = self.run_sync(*mode, FAKE_GET_FAIL=failing)
                    self.assertNotEqual(r.returncode, 0)
                    self.assertIn("reading Vercel environment variables failed", r.stderr)
                    self.assertNotIn(": new", r.stderr)
                self.assertEqual(self.writes(), [])

    def test_missing_token_stops_before_any_api_call(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        empty_home = self.tmp / "home"
        empty_home.mkdir()
        r = self.run_sync("--apply", VERCEL_TOKEN="", HOME=str(empty_home), XDG_DATA_HOME=str(empty_home))
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("no Vercel token", r.stderr)
        self.assertEqual(self.calls("curl"), [])

    def test_new_key_beside_preview_entry_creates_production_only(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "preview-only", target=("preview",), id_="env_prev")])
        r = self.run_sync("--apply")
        self.assertEqual(r.returncode, 0, r.stderr)
        envs = json.loads(self.state.read_text())["envs"]
        self.assertEqual(next(e for e in envs if e["id"] == "env_prev")["value"], "preview-only")
        prod = [e for e in envs if e["key"] == "SITE_FLAG" and e["target"] == ["production"]]
        self.assertEqual(len(prod), 1)
        self.assertEqual(self.calls("patch"), [])

    def test_create_conflict_stops_without_redeploy(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        # A branch-scoped Production entry is invisible to the comparison but
        # overlaps the target: the create must be refused, not merged.
        e = entry("SITE_FLAG", "branch", id_="env_branch")
        e["gitBranch"] = "feature"
        self.set_vercel([e])
        r = self.run_sync("--apply")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("creating SITE_FLAG in Vercel failed", r.stderr)
        self.assertFalse([c for c in self.calls("vercel") if "redeploy" in c])

    def test_failed_redeploy_is_reported(self):
        self.commit_keys("SITE_FLAG")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", "old")])
        r = self.run_sync("--apply", FAKE_REDEPLOY_FAIL="1")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("redeploy dpl_latest failed", r.stderr)

    def test_crlf_allowlist(self):
        (self.repo / "deploy").mkdir(exist_ok=True)
        self.commit_keys()
        (self.repo / "deploy" / "doppler-keys.txt").write_text("SITE_FLAG\r\n")
        self.git("add", "-A"); self.git("commit", "-q", "-m", "crlf")
        self.set_doppler({"SITE_FLAG": SECRET})
        self.set_vercel([entry("SITE_FLAG", SECRET)])
        r = self.run_sync()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("SITE_FLAG: unchanged", r.stderr)

    def test_unknown_argument(self):
        self.commit_keys()
        r = self.run_sync("--force")
        self.assertEqual(r.returncode, 2)


if __name__ == "__main__":
    unittest.main()
