import zora from "@/lib/adapters/zora";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const response = await zora.getCoins(cursor);
  return NextResponse.json({ data: response }, { status: 200 });
}
