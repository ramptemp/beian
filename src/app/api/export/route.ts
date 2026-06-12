import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllBeian, getAllServers } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
    const ids = idsParam ? idsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0) : [];

    const allBeianRecords = getAllBeian();
    const allServers = getAllServers();

    const beianRecords = ids.length > 0 ? allBeianRecords.filter((r) => ids.includes(r.id)) : allBeianRecords;
    const beianIds = new Set(beianRecords.map((r) => r.id));
    const servers = allServers.filter((s) => beianIds.has(s.beian_id));

    const wb = XLSX.utils.book_new();

    // Sheet 1: 备案系统
    const beianData = beianRecords.map((r) => ({
      ID: r.id,
      系统名称: r.name,
      系统域名: r.domain,
      系统描述: r.description,
      负责人姓名: r.owner_name,
      负责人部门: r.owner_dept,
      联系方式: r.owner_contact,
      备案状态: r.status,
      备案编号: r.beian_no,
      备案时间: r.beian_date,
      安全等级: r.security_level,
      供应商: r.vendor,
      技术联系人: r.tech_contact,
      联系电话: r.tech_phone,
      备注: r.notes,
      创建时间: r.created_at,
      更新时间: r.updated_at,
    }));
    const ws1 = XLSX.utils.json_to_sheet(beianData);
    XLSX.utils.book_append_sheet(wb, ws1, "备案系统");

    // Sheet 2: 服务器
    const serverData = servers.map((s) => ({
      ID: s.id,
      所属系统: s.system_name,
      IP地址: s.ip_address,
      操作系统: s.os,
      中间件: s.middleware,
      数据库: s.db_type,
      CPU内存: s.cpu_memory,
      硬盘: s.disk,
      机房位置: s.location,
      用途: s.purpose,
      备注: s.notes,
      创建时间: s.created_at,
      更新时间: s.updated_at,
    }));
    const ws2 = XLSX.utils.json_to_sheet(serverData);
    XLSX.utils.book_append_sheet(wb, ws2, "服务器");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="beian_export_${new Date().toISOString().slice(0, 10)}.xlsx"; filename*=UTF-8''${encodeURIComponent(`备案数据导出_${new Date().toISOString().slice(0, 10)}.xlsx`)}`
      },
    });
  } catch (e: any) {
    console.error("Export error:", e);
    return NextResponse.json({ error: "导出失败: " + (e.message || String(e)) }, { status: 500 });
  }
}
