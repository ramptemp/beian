import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { verifyAdmin, updateAdminPassword } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "当前密码和新密码不能为空" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码长度不能少于 6 位" }, { status: 400 });
    }

    const valid = verifyAdmin(decoded.username, currentPassword);
    if (!valid) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
    }

    updateAdminPassword(decoded.username, newPassword);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "修改失败" }, { status: 500 });
  }
}
