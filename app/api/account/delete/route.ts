import { FieldValue } from "firebase-admin/firestore";
import { ApiError, apiErrorResponse, requireFirebaseUser } from "@/services/api/serverAuth";
import { getAdminAuth, getAdminFirestore } from "@/services/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    const token = await requireFirebaseUser(request);
    const authTime = Number(token.auth_time || 0) * 1000;
    if (!authTime || Date.now() - authTime > 5 * 60 * 1000) {
      throw new ApiError("Vuelve a autenticarte antes de eliminar la cuenta.", 409);
    }

    const db = getAdminFirestore();
    const requestRef = db.doc(`deletionRequests/${token.uid}`);
    await requestRef.set({ uid: token.uid, status: "processing", updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    try {
      await db.recursiveDelete(db.doc(`users/${token.uid}`));
      await getAdminAuth().deleteUser(token.uid).catch((error: { code?: string }) => {
        if (error.code !== "auth/user-not-found") throw error;
      });
      await requestRef.set({ status: "completed", completedAt: FieldValue.serverTimestamp() }, { merge: true });
    } catch (error) {
      await requestRef.set({
        status: "pending",
        error: error instanceof Error ? error.message : String(error),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      throw error;
    }

    return Response.json({ status: "completed" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
