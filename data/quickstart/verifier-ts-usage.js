import { parseJson, systemNow, verifyEnvelope } from "@agentidentitytrustprotocol/verifier";

// parseJson rejects duplicate keys, which JSON.parse silently accepts.
const envelope = await verifyEnvelope(parseJson(message), { now: systemNow() });
