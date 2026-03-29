import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return Response.json(null);
  }

  return Response.json({
    heightCm: user.height,
    weightKg: user.weight,
    age: user.age,
    sex: user.gender,
    bmr: user.bmr,
  });
}

export async function PUT(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  const body = await request.json();
  const { heightCm, weightKg, age, sex, bmr } = body;

  const user = await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      height: heightCm ?? null,
      weight: weightKg ?? null,
      age: age ?? null,
      gender: sex ?? null,
      bmr: bmr ?? null,
    },
    update: {
      height: heightCm ?? null,
      weight: weightKg ?? null,
      age: age ?? null,
      gender: sex ?? null,
      bmr: bmr ?? null,
    },
  });

  return Response.json({
    heightCm: user.height,
    weightKg: user.weight,
    age: user.age,
    sex: user.gender,
    bmr: user.bmr,
  });
}
