import { NextResponse } from "next/server";
import { getServersByBeianId, searchServers, createServer } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip") || undefined;
    const beianId = searchParams.get("beian_id");

    if (beianId) {
      const servers = getServersByBeianId(Number(beianId));
      return NextResponse.json({ servers });
    }

    const servers = searchServers(ip);
    return NextResponse.json({ servers });
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
    if (!body.beian_id || !body.ip_address) {
      return NextResponse.json({ error: "所属系统和IP地址不能为空" }, { status: 400 });
    }

    const id = createServer(body);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
