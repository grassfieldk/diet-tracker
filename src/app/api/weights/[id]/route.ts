import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;
  const { id } = await params;

  const body = await request.json();
  const { weight } = body;

  if (weight == null || typeof weight !== "number") {
    return Response.json({ error: "weight is required" }, { status: 400 });
  }

  try {
    const record = await prisma.weightRecord.update({
      where: { id, userId },
      data: { weight },
    });
    return Response.json({
      id: record.id,
      weight: record.weight,
      recordedAt: record.recordedAt,
    });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;
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
