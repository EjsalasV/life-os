import { apiErrorResponse, requireFirebaseUser, ApiError } from "@/services/api/serverAuth";
import { processCheckout } from "@/modules/sales/services/checkoutService";
export const runtime = "nodejs";
export async function POST(request: Request): Promise<Response> {
  try {
    const { uid } = await requireFirebaseUser(request);
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
    return Response.json(await processCheckout(uid, body));
  } catch (error) { return apiErrorResponse(error); }
}
