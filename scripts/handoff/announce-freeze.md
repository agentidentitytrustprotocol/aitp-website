# Handoff: announce the aitp/0.3 freeze and open the review (H2.1)

Status: **done 2026-10-25.** Kept as the record of what was done and how to
correct it.

## Decision

The owner chose **no external posts**: no Hacker News, no A2A or MCP community
forums, and no mailing lists (IETF WIMSE included). The announcement is the
site post plus the pinned spec Discussion. With no personal-account posting,
nothing in this checklist needs a human.

## Checklist

- [x] Merge and deploy WEB2.1 (#66, `e8de7a4`). The post is live at
      https://agentidentitytrustprotocol.io/news/aitp-0.3-freeze. The feed at
      `/news/rss.xml` passes the W3C feed validator.
- [x] The review Discussion is open and pinned:
      https://github.com/agentidentitytrustprotocol/agentidentitytrustprotocol/discussions/117.
      It opened 2026-10-24 and closes no earlier than 2027-01-10.
- [x] The post's dates equal the Discussion's. They live once, in the post's
      `review` frontmatter, and `npm run check-review-dates` fails CI if they
      drift from the Discussion's **Opens:** and **Closes:** lines.
- [ ] Record the review-window start (2026-10-24) in the spec's S2.4
      disposition file. That file belongs to the spec repo and does not exist
      yet; whoever creates it at S2.4 records the start date from the
      Discussion.

## Changing the dates

Edit the Discussion and the post's `review` frontmatter in the same sitting.
CI fails until they agree again.

## Rollback

Never delete the post: people may already cite it. To correct it, edit it
and add a dated correction note at the top saying what changed. The same goes
for the Discussion: edit it and keep its history visible.
