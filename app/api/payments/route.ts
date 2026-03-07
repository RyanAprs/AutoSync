import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ payments: [] });
}

export async function POST() {
  return NextResponse.json({ id: "" }, { status: 201 });
}
