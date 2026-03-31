import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

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
    birthDate: user.birthDate?.toISOString() ?? null,
    sex: user.gender,
    bmr: user.bmr,
    tdee: user.tdee,
    activityLevel: user.activityLevel,
    calTarget: user.calTarget,
  });
}

export async function PUT(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.sub;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    heightCm,
    weightKg,
    age,
    birthDate,
    sex,
    bmr,
    tdee,
    activityLevel,
    calTarget,
  } = body as {
    heightCm?: unknown;
    weightKg?: unknown;
    age?: unknown;
    birthDate?: unknown;
    sex?: unknown;
    bmr?: unknown;
    tdee?: unknown;
    activityLevel?: unknown;
    calTarget?: unknown;
  };

  const parsedBirthDate =
    birthDate == null ? null : new Date(String(birthDate));
  if (parsedBirthDate && Number.isNaN(parsedBirthDate.getTime())) {
    return Response.json({ error: "birthDate is invalid" }, { status: 400 });
  }

  const numericFields = [
    ["heightCm", heightCm],
    ["weightKg", weightKg],
    ["age", age],
    ["bmr", bmr],
    ["tdee", tdee],
  ] as const;
  for (const [field, value] of numericFields) {
    if (value != null && !isFiniteNumber(value)) {
      return Response.json(
        { error: `${field} must be a finite number` },
        { status: 400 },
      );
    }
  }

  if (sex != null && !["male", "female", "other"].includes(String(sex))) {
    return Response.json({ error: "sex is invalid" }, { status: 400 });
  }
  if (
    activityLevel != null &&
    !["sedentary", "light", "moderate", "active", "very_active"].includes(
      String(activityLevel),
    )
  ) {
    return Response.json(
      { error: "activityLevel is invalid" },
      { status: 400 },
    );
  }
  if (calTarget != null && !["bmr", "tdee"].includes(String(calTarget))) {
    return Response.json({ error: "calTarget is invalid" }, { status: 400 });
  }

  const heightValue = heightCm == null ? null : (heightCm as number);
  const weightValue = weightKg == null ? null : (weightKg as number);
  const ageValue = age == null ? null : (age as number);
  const bmrValue = bmr == null ? null : (bmr as number);
  const tdeeValue = tdee == null ? null : (tdee as number);
  const sexValue = sex == null ? null : String(sex);
  const activityLevelValue =
    activityLevel == null ? null : String(activityLevel);
  const calTargetValue = calTarget == null ? null : String(calTarget);

  const user = await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      height: heightValue,
      weight: weightValue,
      age: ageValue,
      birthDate: parsedBirthDate,
      gender: sexValue,
      bmr: bmrValue,
      tdee: tdeeValue,
      activityLevel: activityLevelValue,
      calTarget: calTargetValue,
    },
    update: {
      height: heightValue,
      weight: weightValue,
      age: ageValue,
      birthDate: parsedBirthDate,
      gender: sexValue,
      bmr: bmrValue,
      tdee: tdeeValue,
      activityLevel: activityLevelValue,
      calTarget: calTargetValue,
    },
  });

  return Response.json({
    heightCm: user.height,
    weightKg: user.weight,
    age: user.age,
    birthDate: user.birthDate?.toISOString() ?? null,
    sex: user.gender,
    bmr: user.bmr,
    tdee: user.tdee,
    activityLevel: user.activityLevel,
    calTarget: user.calTarget,
  });
}
