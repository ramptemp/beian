import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBeianById, getServersByBeianId } from "@/lib/data";
import { verifyToken } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

function statusClass(status: string) {
  if (status === "已备案") return "status-done";
  if (status === "待备案") return "status-pending";
  return "status-none";
}

function statusIcon(status: string) {
  if (status === "已备案") return "✅";
  if (status === "待备案") return "⏳";
  return "❌";
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-[#f1f5f9] last:border-0">
      <div className="text-xs text-[#94a3b8] mb-1">{label}</div>
      <div className="text-sm text-[#0f172a]">{value}</div>
    </div>
  );
}

export default async function RecordPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const record = getBeianById(Number(id));
  if (!record) return notFound();
  const servers = getServersByBeianId(Number(id));

  return (
    <>
      {/* Header */}
      <header className="bg-[#1e4a8c] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">学校信息系统备案管理平台</h1>
              <p className="text-sm text-[#dbeafe] mt-1">系统备案详情</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-5 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                ← 返回列表
              </Link>
              <a
                href="/admin/login"
                className="px-5 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                退出
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Title Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">{record.name}</h2>
              {record.domain && (
                <a
                  href={record.domain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1e4a8c] hover:underline mt-1 inline-block"
                >
                  {record.domain}
                </a>
              )}
            </div>
            <span className={`status-badge ${statusClass(record.status)}`}>
              {statusIcon(record.status)} {record.status}
            </span>
          </div>
          {record.description && (
            <p className="text-sm text-[#475569] mt-4 leading-relaxed">{record.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              基本信息
            </h3>
            <InfoRow label="备案编号" value={record.beian_no} />
            <InfoRow label="备案时间" value={record.beian_date} />
            <InfoRow label="系统域名" value={record.domain} />
            <InfoRow label="安全等级" value={record.security_level} />
            <InfoRow label="供应商" value={record.vendor} />
          </div>

          {/* 负责人信息 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              负责人信息
            </h3>
            <InfoRow label="姓名" value={record.owner_name} />
            <InfoRow label="部门" value={record.owner_dept} />
            <InfoRow label="联系方式" value={record.owner_contact} />
          </div>

          {/* 技术信息 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              技术信息
            </h3>
            <InfoRow label="技术联系人" value={record.tech_contact} />
            <InfoRow label="联系电话" value={record.tech_phone} />
          </div>

          {/* 备注 */}
          {record.notes && (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
                备注
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">{record.notes}</p>
            </div>
          )}
        </div>

        {/* 服务器列表 */}
        <div className="mt-6 bg-white border border-[#e2e8f0] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
            服务器清单 ({servers.length} 台)
          </h3>
          {servers.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">暂无服务器记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f3f4f8]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium">IP 地址</th>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium">操作系统</th>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium hidden sm:table-cell">中间件</th>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">数据库</th>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">配置</th>
                    <th className="px-4 py-3 text-left text-[#475569] font-medium hidden lg:table-cell">机房位置</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {servers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#f8f9fc]">
                      <td className="px-4 py-3 font-mono text-[#0f172a]">{s.ip_address}</td>
                      <td className="px-4 py-3 text-[#475569]">{s.os || "—"}</td>
                      <td className="px-4 py-3 text-[#475569] hidden sm:table-cell">{s.middleware || "—"}</td>
                      <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{s.db_type || "—"}</td>
                      <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{s.cpu_memory || "—"}</td>
                      <td className="px-4 py-3 text-[#475569] hidden lg:table-cell">{s.location || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 元信息 */}
        <div className="mt-6 text-xs text-[#94a3b8] text-center">
          <p>创建时间：{new Date(record.created_at).toLocaleString("zh-CN")}</p>
          <p className="mt-1">更新时间：{new Date(record.updated_at).toLocaleString("zh-CN")}</p>
        </div>
      </main>
    </>
  );
}
