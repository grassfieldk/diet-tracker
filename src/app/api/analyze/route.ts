import { auth0 } from "@/lib/auth0";
import { analyzeMock } from "@/lib/mock-ai";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { text } = body;

  if (!text || typeof text !== "string") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const result = analyzeMock(text.trim());

  return Response.json(result);
}
