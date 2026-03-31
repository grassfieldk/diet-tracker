import { requireUserId } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;
  const { id } = await params;

  try {
    await prisma.exerciseRecord.delete({ where: { id, userId } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
