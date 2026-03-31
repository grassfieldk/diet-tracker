import { auth0 } from "@/lib/auth0";

export async function requireUserId(): Promise<
  { userId: string } | { response: Response }
> {
  const session = await auth0.getSession();
  if (!session) {
    return {
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.sub };
}

export async function parseJsonBody<T>(
  request: Request,
): Promise<{ data: T } | { response: Response }> {
  try {
    const data = (await request.json()) as T;
    return { data };
  } catch {
    return {
      response: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}
