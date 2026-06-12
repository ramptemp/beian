import { NextResponse } from "next/server";
import { batchCreateServers } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json({ error: "数据格式错误，请提供 records 数组" }, { status: 400 });
    }

    const validRecords = body.records.filter((r: any) => r.system_name?.trim() && r.ip_address?.trim());
    if (validRecords.length === 0) {
      return NextResponse.json({ error: "没有有效的记录（system_name 和 ip_address 不能为空）" }, { status: 400 });
    }

    const result = batchCreateServers(validRecords);
    return NextResponse.json({ success: true, ...result, total: body.records.length });
  } catch {
    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}
