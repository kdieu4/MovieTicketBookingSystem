import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("mtbs_access_token")?.value;

  return NextResponse.json(
    {
      hasSession: Boolean(accessToken),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
