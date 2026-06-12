"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface BeianRecord {
  id: number;
  name: string;
  domain: string | null;
  owner_name: string | null;
  owner_dept: string | null;
  status: string;
}

interface Server {
  id: number;
  beian_id: number;
  ip_address: string;
  os: string | null;
  middleware: string | null;
  db_type: string | null;
  cpu_memory: string | null;
  disk: string | null;
  location: string | null;
  system_name: string;
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

export default function TabSection({
  allRecords,
  servers,
  ipFilter,
  beianFilter,
  osFilter,
  middlewareFilter,
  dbTypeFilter,
  locationFilter,
}: {
  allRecords: BeianRecord[];
  servers: Server[];
  ipFilter?: string;
  beianFilter?: number;
  osFilter?: string;
  middlewareFilter?: string;
  dbTypeFilter?: string;
  locationFilter?: string;
}) {
  const hasServerFilter = ipFilter || beianFilter || osFilter || middlewareFilter || dbTypeFilter || locationFilter;
  const [activeTab, setActiveTab] = useState<"systems" | "servers">(
    hasServerFilter ? "servers" : "systems"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 统计
  const totalCount = allRecords.length;
  const doneCount = allRecords.filter((r) => r.status === "已备案").length;
  const pendingCount = allRecords.filter((r) => r.status === "待备案").length;
  const noneCount = allRecords.filter((r) => r.status === "未备案").length;

  // 过滤 + 搜索
  const filteredRecords = allRecords.filter((r) => {
    const matchStatus = !statusFilter || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.owner_name || "").toLowerCase().includes(q) ||
      (r.owner_dept || "").toLowerCase().includes(q) ||
      (r.domain || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(null)}
          className={`bg-white border rounded-xl p-4 text-center transition-all cursor-pointer ${
            !statusFilter
              ? "border-[#1e4a8c] ring-2 ring-[#1e4a8c]/20"
              : "border-[#e2e8f0] hover:border-[#cbd5e1]"
          }`}
        >
          <div className="text-2xl font-extrabold text-[#0f172a]">{totalCount}</div>
          <div className="text-xs text-[#94a3b8] mt-1">系统总数</div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === "已备案" ? null : "已备案")}
          className={`bg-white border rounded-xl p-4 text-center transition-all cursor-pointer ${
            statusFilter === "已备案"
              ? "border-[#10b981] ring-2 ring-[#10b981]/20"
              : "border-[#e2e8f0] hover:border-[#cbd5e1]"
          }`}
        >
          <div className="text-2xl font-extrabold text-[#10b981]">{doneCount}</div>
          <div className="text-xs text-[#94a3b8] mt-1">已备案</div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === "待备案" ? null : "待备案")}
          className={`bg-white border rounded-xl p-4 text-center transition-all cursor-pointer ${
            statusFilter === "待备案"
              ? "border-[#f59e0b] ring-2 ring-[#f59e0b]/20"
              : "border-[#e2e8f0] hover:border-[#cbd5e1]"
          }`}
        >
          <div className="text-2xl font-extrabold text-[#f59e0b]">{pendingCount}</div>
          <div className="text-xs text-[#94a3b8] mt-1">待备案</div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === "未备案" ? null : "未备案")}
          className={`bg-white border rounded-xl p-4 text-center transition-all cursor-pointer ${
            statusFilter === "未备案"
              ? "border-[#ef4444] ring-2 ring-[#ef4444]/20"
              : "border-[#e2e8f0] hover:border-[#cbd5e1]"
          }`}
        >
          <div className="text-2xl font-extrabold text-[#ef4444]">{noneCount}</div>
          <div className="text-xs text-[#94a3b8] mt-1">未备案</div>
        </button>
      </div>

      {/* Search + Tab Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索系统名称、负责人、部门..."
            className="px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-sm w-full sm:w-72 focus:outline-none focus:border-[#1e4a8c]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-sm hover:bg-[#f3f4f8] transition-colors whitespace-nowrap"
            >
              重置
            </button>
          )}
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-sm hover:bg-[#f3f4f8] transition-colors whitespace-nowrap"
            >
              清除筛选
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#f3f4f8] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("systems")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "systems"
                ? "bg-white text-[#1e4a8c] shadow-sm"
                : "text-[#475569]"
            }`}
          >
            系统列表 ({filteredRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("servers")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "servers"
                ? "bg-white text-[#1e4a8c] shadow-sm"
                : "text-[#475569]"
            }`}
          >
            服务器列表 ({servers.length})
          </button>
        </div>
      </div>

      {/* System List */}
      {activeTab === "systems" && (
        <div className="space-y-4">
          {pagedRecords.length === 0 ? (
            <div className="text-center py-20 text-[#94a3b8]">
              <p className="text-lg">暂无备案记录</p>
              <p className="text-sm mt-2">请登录管理后台添加系统备案信息</p>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f3f4f8]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#475569] font-medium">系统名称</th>
                      <th className="px-4 py-3 text-left text-[#475569] font-medium hidden sm:table-cell">负责人</th>
                      <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">部门</th>
                      <th className="px-4 py-3 text-left text-[#475569] font-medium">备案状态</th>
                      <th className="px-4 py-3 text-right text-[#475569] font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {pagedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-[#f8f9fc]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#0f172a]">{record.name}</div>
                          {record.domain && (
                            <div className="text-xs text-[#94a3b8] mt-0.5">{record.domain}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#475569] hidden sm:table-cell">
                          {record.owner_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#475569] hidden md:table-cell">
                          {record.owner_dept || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${statusClass(record.status)}`}>
                            {statusIcon(record.status)} {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/records/${record.id}`}
                            className="text-[#1e4a8c] hover:underline text-xs font-medium"
                          >
                            查看详情 →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={safePage} totalPages={totalPages} totalRecords={filteredRecords.length} onPageChange={setCurrentPage} />
          )}
        </div>
      )}

      {/* Server List */}
      {activeTab === "servers" && (
        <ServerSearchTable
          servers={servers}
          records={allRecords}
          ipFilter={ipFilter}
          beianFilter={beianFilter}
          osFilter={osFilter}
          middlewareFilter={middlewareFilter}
          dbTypeFilter={dbTypeFilter}
          locationFilter={locationFilter}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-[#94a3b8]">
        共 {totalRecords} 条记录，第 {currentPage} / {totalPages} 页
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            currentPage <= 1
              ? "border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
              : "border-[#e2e8f0] text-[#475569] hover:bg-[#f3f4f8]"
          }`}
        >
          上一页
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-[#94a3b8]">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-[#1e4a8c] text-white"
                  : "text-[#475569] hover:bg-[#f3f4f8]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            currentPage >= totalPages
              ? "border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
              : "border-[#e2e8f0] text-[#475569] hover:bg-[#f3f4f8]"
          }`}
        >
          下一页
        </button>
      </div>
    </div>
  );
}

function ServerSearchTable({
  servers,
  records,
  ipFilter,
  beianFilter,
  osFilter,
  middlewareFilter,
  dbTypeFilter,
  locationFilter,
}: {
  servers: Server[];
  records: BeianRecord[];
  ipFilter?: string;
  beianFilter?: number;
  osFilter?: string;
  middlewareFilter?: string;
  dbTypeFilter?: string;
  locationFilter?: string;
}) {
  const hasAnyFilter = ipFilter || beianFilter || osFilter || middlewareFilter || dbTypeFilter || locationFilter;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-[#e2e8f0]">
        <form action="/" method="get" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              name="ip"
              defaultValue={ipFilter || ""}
              placeholder="搜索 IP 地址..."
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            />
            <select
              name="beian_id"
              defaultValue={beianFilter || ""}
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            >
              <option value="">全部所属系统</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <input
              name="os"
              defaultValue={osFilter || ""}
              placeholder="搜索操作系统..."
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            />
            <input
              name="middleware"
              defaultValue={middlewareFilter || ""}
              placeholder="搜索中间件..."
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            />
            <input
              name="db_type"
              defaultValue={dbTypeFilter || ""}
              placeholder="搜索数据库..."
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            />
            <input
              name="location"
              defaultValue={locationFilter || ""}
              placeholder="搜索机房位置..."
              className="px-4 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#1e4a8c]"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1e4a8c] text-white text-sm font-medium hover:bg-[#153a70] transition-colors"
            >
              查询
            </button>
            {hasAnyFilter && (
              <a
                href="/"
                className="px-5 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-sm font-medium hover:bg-[#f3f4f8] transition-colors text-center"
              >
                重置
              </a>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f3f4f8]">
            <tr>
              <th className="px-4 py-3 text-left text-[#475569] font-medium">IP 地址</th>
              <th className="px-4 py-3 text-left text-[#475569] font-medium">所属系统</th>
              <th className="px-4 py-3 text-left text-[#475569] font-medium hidden sm:table-cell">操作系统</th>
              <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">中间件</th>
              <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">数据库</th>
              <th className="px-4 py-3 text-left text-[#475569] font-medium hidden lg:table-cell">机房位置</th>
              <th className="px-4 py-3 text-right text-[#475569] font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {servers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#94a3b8]">
                  暂无服务器记录
                </td>
              </tr>
            ) : (
              servers.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9fc]">
                  <td className="px-4 py-3 font-mono text-[#0f172a] font-medium">{s.ip_address}</td>
                  <td className="px-4 py-3 text-[#475569]">{s.system_name}</td>
                  <td className="px-4 py-3 text-[#475569] hidden sm:table-cell">{s.os || "—"}</td>
                  <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{s.middleware || "—"}</td>
                  <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{s.db_type || "—"}</td>
                  <td className="px-4 py-3 text-[#475569] hidden lg:table-cell">{s.location || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/records/${s.beian_id}`}
                      className="text-[#1e4a8c] hover:underline text-xs font-medium"
                    >
                      查看系统 →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
