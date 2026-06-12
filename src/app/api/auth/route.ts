import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/data";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "beian-local-secret-key-2024";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
    }

    if (!verifyAdmin(username, password)) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
