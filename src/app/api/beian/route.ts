import { NextResponse } from "next/server";
import { getAllBeian, getBeianPage } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("all") === "1") {
      const records = getAllBeian();
      return NextResponse.json({ records, total: records.length });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    if (page < 1 || pageSize < 1) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const { records, total } = getBeianPage(page, pageSize);
    return NextResponse.json({ records, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "系统名称不能为空" }, { status: 400 });
    }

    const { createBeian } = await import("@/lib/data");
    const id = createBeian(body);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
