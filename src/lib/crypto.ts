import crypto from "node:crypto";

export function hashApiKey(key: string, pepper: string) {
  return crypto.createHash("sha256").update(`${key}:${pepper}`).digest("hex");
}

export function generateApiKey() {
  return `mtr_${crypto.randomBytes(24).toString("hex")}`;
}

export function keyPreview(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}
