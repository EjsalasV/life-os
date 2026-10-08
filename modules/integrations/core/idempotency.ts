import { createHash } from "node:crypto";
import type { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Transaction } from "firebase-admin/firestore";
import { ApiError } from "@/services/api/serverAuth";

export type IdempotencySnapshot = Pick<DocumentSnapshot, "exists" | "data"> | null;

/** The hash and path are intentionally stable: existing Telegram records use them. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createIdempotencyRef(db: Firestore, telegramUserId: string, key?: string): DocumentReference | null {
  return key ? db.doc(`integrations/telegram/idempotency/${sha256(`${telegramUserId}:${key}`)}`) : null;
}

export function createIdempotencyFingerprint(serializedOperation: string): string {
  return sha256(serializedOperation);
}

export function readIdempotentResult<T>(snapshot: IdempotencySnapshot, expectedFingerprint: string): T | undefined {
  if (!snapshot?.exists) return undefined;
  const data = snapshot.data() as { fingerprint?: unknown; result?: T } | undefined;
  if (data?.fingerprint !== expectedFingerprint) {
    throw new ApiError("La idempotencyKey ya fue usada con otros datos.", 409);
  }
  return data.result;
}

export function writeIdempotencyResult<T>(
  transaction: Transaction,
  ref: DocumentReference | null,
  fingerprint: string,
  result: T,
  createdAt: unknown
): void {
  if (!ref) return;
  transaction.create(ref, { fingerprint, result, createdAt } as DocumentData);
}
