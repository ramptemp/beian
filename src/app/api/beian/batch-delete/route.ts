import { NextResponse } from "next/server";
import { batchDeleteBeian } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: "请提供要删除的记录 ID 数组" }, { status: 400 });
    }

    const result = batchDeleteBeian(body.ids.map(Number));
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "批量删除失败" }, { status: 500 });
  }
}
