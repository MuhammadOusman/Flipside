import { NextResponse } from "next/server";

function disabledAuthResponse() {
  return NextResponse.json(
    {
      error: "NextAuth route is disabled. Use Supabase auth endpoints.",
    },
    { status: 410 }
  );
}

export function GET() {
  return disabledAuthResponse();
}

export function POST() {
  return disabledAuthResponse();
}
