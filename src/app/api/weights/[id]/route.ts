import { parseJsonBody, requireUserId } from "@/lib/api/request";
import { toWeightResponse } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;
  const { id } = await params;

  const parsedBody = await parseJsonBody<{ weight?: unknown }>(request);
  if ("response" in parsedBody) {
    return parsedBody.response;
  }
  const { weight } = parsedBody.data;

  if (
    weight == null ||
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight < 10 ||
    weight > 500
  ) {
    return Response.json({ error: "weight is required" }, { status: 400 });
  }

  try {
    const record = await prisma.weightRecord.update({
      where: { id, userId },
      data: { weight },
    });
    return Response.json(toWeightResponse(record));
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireUserId();
  if ("response" in auth) {
    return auth.response;
  }
  const { userId } = auth;
  const { id } = await params;

  try {
    await prisma.weightRecord.delete({
      where: { id, userId },
    });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
