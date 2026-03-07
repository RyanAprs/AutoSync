import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  return NextResponse.json({ id: boardId });
}

export async function PATCH() {
  return NextResponse.json({});
}

export async function DELETE() {
  return NextResponse.json({}, { status: 204 });
}
