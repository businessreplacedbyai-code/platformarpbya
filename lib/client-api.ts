import crypto from "crypto";

// Plain module — sync helpers for API key hashing.
export function hashApiKey(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function signWebhookPayload(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
