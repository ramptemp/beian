"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Record {
  id: number;
  name: string;
  domain: string | null;
  owner_name: string | null;
  owner_dept: string | null;
  status: string;
  beian_no: string | null;
  created_at: string;
}

const statusOptions = ["已备案", "待备案", "未备案"];
const securityOptions = ["一级", "二级", "三级", "四级", "五级"];

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState<"system" | "server">("system");
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Server management state
  const [servers, setServers] = useState<any[]>([]);
  const [showServerForm, setShowServerForm] = useState(false);
  const [editingServerId, setEditingServerId] = useState<number | null>(null);
  const [managingServerId, setManagingServerId] = useState<number | null>(null);
  const [managingServerName, setManagingServerName] = useState("");
  const [serverForm, setServerForm] = useState({
    ip_address: "",
    os: "",
    middleware: "",
    db_type: "",
    cpu_memory: "",
    disk: "",
    location: "",
    purpose: "",
    notes: "",
  });

  const [form, setForm] = useState({
    name: "",
    domain: "",
    description: "",
    owner_name: "",
    owner_dept: "",
    owner_contact: "",
    status: "未备案",
    beian_no: "",
    beian_date: "",
    security_level: "",
    vendor: "",
    tech_contact: "",
    tech_phone: "",
    notes: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchRecords(t);
  }, [router]);

  const fetchRecords = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/beian?all=1", { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function resetForm() {
    setForm({
      name: "",
      domain: "",
      description: "",
      owner_name: "",
      owner_dept: "",
      owner_contact: "",
      status: "未备案",
      beian_no: "",
      beian_date: "",
      security_level: "",
      vendor: "",
      tech_contact: "",
      tech_phone: "",
      notes: "",
    });
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.name) {
      alert("系统名称不能为空");
      return;
    }

    const body = { ...form };

    try {
      if (editingId) {
        const res = await fetch(`/api/beian/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("更新失败");
      } else {
        const res = await fetch("/api/beian", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("创建失败");
      }

      resetForm();
      setShowForm(false);
      fetchRecords(token);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这条备案记录？")) return;
    try {
      const res = await fetch(`/api/beian/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("删除失败");
      fetchRecords(token);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleBatchDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`确定批量删除选中的 ${ids.length} 条备案记录？此操作不可恢复。`)) return;
    try {
      const res = await fetch("/api/beian/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("批量删除失败");
      setSelectedIds(new Set());
      fetchRecords(token);
    } catch (e: any) {
      alert(e.message);
    }
  }

  function toggleSelectAll() {
    const pageIds = pagedRecords.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    setSelectedIds(next);
  }

  function toggleSelectRow(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  // Server management
  async function fetchServers(beianId: number) {
    try {
      const res = await fetch(`/api/servers?beian_id=${beianId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setServers(data.servers || []);
    } catch {
      setServers([]);
    }
  }

  function resetServerForm() {
    setServerForm({
      ip_address: "",
      os: "",
      middleware: "",
      db_type: "",
      cpu_memory: "",
      disk: "",
      location: "",
      purpose: "",
      notes: "",
    });
    setEditingServerId(null);
    setShowServerForm(false);
  }

  async function handleSaveServer() {
    const beianId = editingId || managingServerId;
    if (!beianId) return;
    if (!serverForm.ip_address) {
      alert("IP 地址不能为空");
      return;
    }

    const body = { ...serverForm, beian_id: beianId };

    try {
      if (editingServerId) {
        const res = await fetch(`/api/servers/${editingServerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("更新失败");
      } else {
        const res = await fetch("/api/servers", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("创建失败");
      }

      resetServerForm();
      fetchServers(beianId);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDeleteServer(id: number) {
    if (!confirm("确定删除这台服务器记录？")) return;
    try {
      const res = await fetch(`/api/servers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("删除失败");
      const beianId = editingId || managingServerId;
      if (beianId) fetchServers(beianId);
    } catch (e: any) {
      alert(e.message);
    }
  }

  function startEditServer(server: any) {
    setEditingServerId(server.id);
    setServerForm({
      ip_address: server.ip_address,
      os: server.os || "",
      middleware: server.middleware || "",
      db_type: server.db_type || "",
      cpu_memory: server.cpu_memory || "",
      disk: server.disk || "",
      location: server.location || "",
      purpose: server.purpose || "",
      notes: server.notes || "",
    });
    setShowServerForm(true);
  }

  function openServerManage(record: Record) {
    setManagingServerId(record.id);
    setManagingServerName(record.name);
    setShowForm(false);
    resetForm();
    resetServerForm();
    fetchServers(record.id);
  }

  function closeServerManage() {
    setManagingServerId(null);
    setManagingServerName("");
    resetServerForm();
  }

  function startEdit(record: Record) {
    setEditingId(record.id);
    setForm({
      name: record.name,
      domain: record.domain || "",
      description: "",
      owner_name: record.owner_name || "",
      owner_dept: record.owner_dept || "",
      owner_contact: "",
      status: record.status,
      beian_no: record.beian_no || "",
      beian_date: "",
      security_level: "",
      vendor: "",
      tech_contact: "",
      tech_phone: "",
      notes: "",
    });

    fetch(`/api/beian/${record.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.record) {
          setForm({
            name: d.record.name,
            domain: d.record.domain || "",
            description: d.record.description || "",
            owner_name: d.record.owner_name || "",
            owner_dept: d.record.owner_dept || "",
            owner_contact: d.record.owner_contact || "",
            status: d.record.status,
            beian_no: d.record.beian_no || "",
            beian_date: d.record.beian_date || "",
            security_level: d.record.security_level || "",
            vendor: d.record.vendor || "",
            tech_contact: d.record.tech_contact || "",
            tech_phone: d.record.tech_phone || "",
            notes: d.record.notes || "",
          });
        }
      });

    fetchServers(record.id);
    resetServerForm();
    setManagingServerId(null);
    setShowForm(true);
  }

  // CSV parser (simple, handles basic quoted fields)
  function parseCSV(text: string): any[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const ch = line[j];
        if (ch === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      values.push(current.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.replace(/^"|"$/g, "") || "";
      });
      rows.push(row);
    }
    return rows;
  }

  async function handleImport() {
    let records: any[] = [];
    if (importFile) {
      const text = await importFile.text();
      records = parseCSV(text);
    } else if (importText.trim()) {
      try {
        const parsed = JSON.parse(importText);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        records = parseCSV(importText);
      }
    }

    if (records.length === 0) {
      alert("没有解析到有效数据");
      return;
    }

    if (importMode === "system") {
      records = records.filter((r) => r.name?.trim());
    } else {
      records = records.filter((r) => r.system_name?.trim() && r.ip_address?.trim());
    }

    if (records.length === 0) {
      alert(importMode === "system" ? "没有有效的记录（name 不能为空）" : "没有有效的记录（system_name 和 ip_address 不能为空）");
      return;
    }

    if (!confirm(`确认导入 ${records.length} 条${importMode === "system" ? "备案" : "服务器"}记录？`)) return;

    setImportLoading(true);
    try {
      const endpoint = importMode === "system" ? "/api/beian/batch" : "/api/servers/batch";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "导入失败");
      let msg = `导入成功！共导入 ${data.imported} 条记录`;
      if (data.skipped?.length > 0) {
        msg += `\n\n以下 ${data.skipped.length} 个系统名称未找到，已跳过：\n${data.skipped.slice(0, 10).join("\n")}`;
        if (data.skipped.length > 10) msg += `\n...等共 ${data.skipped.length} 个`;
      }
      alert(msg);
      setShowImport(false);
      setImportText("");
      setImportFile(null);
      fetchRecords(token);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setImportLoading(false);
    }
  }

  function downloadTemplate() {
    let csv = "";
    let filename = "";
    if (importMode === "system") {
      const headers = "name,domain,description,owner_name,owner_dept,owner_contact,status,beian_no,beian_date,security_level,vendor,tech_contact,tech_phone,notes";
      const example = "校园一卡通系统,https://card.university.edu,用于门禁和消费,张三,信息中心,zhangsan@university.edu,已备案,ICP-2024-0001,2024-01-15,三级,XX科技有限公司,李四,13800138000,核心系统";
      csv = `${headers}\n${example}`;
      filename = "备案数据导入模板.csv";
    } else {
      const headers = "system_name,ip_address,os,middleware,db_type,cpu_memory,disk,location,purpose,notes";
      const example = "校园一卡通系统,192.168.1.100,CentOS 7,Nginx + Tomcat,MySQL 8.0,16核/64GB,1TB SSD,信息中心机房A区,应用服务器,主节点";
      csv = `${headers}\n${example}`;
      filename = "服务器数据导入模板.csv";
    }
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  }

  async function handleChangePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert("当前密码和新密码不能为空");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("两次输入的新密码不一致");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "修改失败");
      alert("密码修改成功，请重新登录");
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      logout();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleExport() {
    try {
      let url = "/api/export";
      if (selectedIds.size > 0) {
        url += `?ids=${Array.from(selectedIds).join(",")}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `备案数据导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      alert(e.message);
    }
  }

  const filteredRecords = records.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.owner_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.owner_dept || "").toLowerCase().includes(search.toLowerCase())
  );

  const pagedTotalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const input = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm text-[#475569] mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
        placeholder={placeholder}
      />
    </div>
  );

  const select = (label: string, key: keyof typeof form, options: string[]) => (
    <div>
      <label className="block text-sm text-[#475569] mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
      >
        <option value="">请选择</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  const textarea = (label: string, key: keyof typeof form, placeholder = "") => (
    <div>
      <label className="block text-sm text-[#475569] mb-1">{label}</label>
      <textarea
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm resize-none"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#0f172a]">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">
          <span className="text-[#1e4a8c]">信息系统备案</span>管理后台
        </h1>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-sm text-[#1e4a8c] hover:underline font-medium">查看网站</a>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-sm text-[#1e4a8c] hover:underline font-medium">修改密码</button>
          <button onClick={logout} className="text-sm text-[#94a3b8] hover:text-[#0f172a]">退出</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-8 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#0f172a] mb-2">修改密码</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#475569] mb-1">当前密码</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#475569] mb-1">新密码</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#475569] mb-1">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="px-6 py-2 rounded-lg bg-[#1e4a8c] text-white font-medium hover:bg-[#153a70] transition-colors disabled:opacity-50"
              >
                {passwordLoading ? "修改中..." : "确认修改"}
              </button>
              <button
                onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="px-6 py-2 rounded-lg border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f3f4f8] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="搜索系统名称、负责人..."
              className="px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-sm w-full sm:w-64 focus:outline-none focus:border-[#1e4a8c]"
            />
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); setShowImport(false); }}
              className="px-5 py-2 rounded-lg bg-[#1e4a8c] text-white text-sm font-medium hover:bg-[#153a70] transition-colors whitespace-nowrap"
            >
              {showForm ? "取消" : "+ 新增备案"}
            </button>
            <button
              onClick={() => { setShowImport(!showImport); setShowForm(false); }}
              className="px-5 py-2 rounded-lg border border-[#1e4a8c] text-[#1e4a8c] text-sm font-medium hover:bg-[#1e4a8c] hover:text-white transition-colors whitespace-nowrap"
            >
              {showImport ? "取消导入" : "导入数据"}
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2 rounded-lg border border-[#10b981] text-[#10b981] text-sm font-medium hover:bg-[#10b981] hover:text-white transition-colors whitespace-nowrap"
            >
              导出Excel
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-5 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                批量删除 ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Import Panel */}
        {showImport && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#0f172a]">批量导入</h3>
              <button
                onClick={downloadTemplate}
                className="text-sm text-[#1e4a8c] hover:underline font-medium"
              >
                下载 CSV 模板
              </button>
            </div>

            {/* Mode switch */}
            <div className="flex items-center gap-1 bg-[#f3f4f8] rounded-lg p-1 mb-4 w-fit">
              <button
                onClick={() => setImportMode("system")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  importMode === "system"
                    ? "bg-white text-[#1e4a8c] shadow-sm"
                    : "text-[#475569]"
                }`}
              >
                导入备案系统
              </button>
              <button
                onClick={() => setImportMode("server")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  importMode === "server"
                    ? "bg-white text-[#1e4a8c] shadow-sm"
                    : "text-[#475569]"
                }`}
              >
                导入服务器
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#475569] mb-2">上传 CSV 文件</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-[#475569] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#f3f4f8] file:text-[#1e4a8c] hover:file:bg-[#e2e8f0]"
                />
                <p className="text-xs text-[#94a3b8] mt-1">支持 Excel 另存为的 CSV 格式</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2e8f0]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#94a3b8]">或</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#475569] mb-2">粘贴 CSV 或 JSON 数据</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm font-mono resize-none"
                  placeholder={
                    importMode === "system"
                      ? `CSV 格式（首行为表头）：
name,domain,owner_name,owner_dept,status
系统A,https://a.edu,张三,信息中心,已备案
系统B,https://b.edu,李四,教务处,待备案

JSON 格式：
[
  {"name":"系统A","domain":"https://a.edu","owner_name":"张三","status":"已备案","vendor":"XX公司","tech_contact":"王五","tech_phone":"13800138000"},
  {"name":"系统B","domain":"https://b.edu","owner_name":"李四","status":"待备案","vendor":"YY公司","tech_contact":"赵六","tech_phone":"13900139000"}
]`
                      : `CSV 格式（首行为表头，system_name 关联系统）：
system_name,ip_address,os,middleware,db_type,cpu_memory,disk,location,purpose,notes
校园一卡通系统,192.168.1.100,CentOS 7,Nginx + Tomcat,MySQL 8.0,16核/64GB,1TB SSD,信息中心机房A区,应用服务器,主节点
校园一卡通系统,192.168.1.101,CentOS 7,Nginx,MySQL 8.0,8核/32GB,500GB SSD,信息中心机房A区,数据库服务器,从节点

JSON 格式：
[
  {"system_name":"校园一卡通系统","ip_address":"192.168.1.100","os":"CentOS 7","middleware":"Nginx + Tomcat"},
  {"system_name":"校园一卡通系统","ip_address":"192.168.1.101","os":"CentOS 7","middleware":"Nginx"}
]`
                  }
                />
                <p className="text-xs text-[#94a3b8] mt-1">
                  {importMode === "system"
                    ? "自动识别 CSV 或 JSON 格式，name 字段必填"
                    : "自动识别 CSV 或 JSON 格式，system_name（系统名称）和 ip_address 必填，system_name 必须与已有备案系统的名称完全匹配"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importLoading}
                  className="px-6 py-2 rounded-lg bg-[#1e4a8c] text-white font-medium hover:bg-[#153a70] transition-colors disabled:opacity-50"
                >
                  {importLoading ? "导入中..." : "开始导入"}
                </button>
                <button
                  onClick={() => { setShowImport(false); setImportText(""); setImportFile(null); }}
                  className="px-6 py-2 rounded-lg border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f3f4f8] transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-8 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-[#0f172a] mb-2">
              {editingId ? "编辑备案" : "新增备案"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {input("系统名称 *", "name", "text", "校园一卡通系统")}
              {input("系统域名", "domain", "text", "https://card.university.edu")}
              {select("备案状态", "status", statusOptions)}
              {input("备案编号", "beian_no", "text", "ICP-2024-0001")}
              {input("备案时间", "beian_date", "date")}
              {input("负责人姓名", "owner_name", "text", "张三")}
              {input("负责人部门", "owner_dept", "text", "信息中心")}
              {input("联系方式", "owner_contact", "text", "zhangsan@university.edu")}
              {select("安全等级", "security_level", securityOptions)}
              {input("供应商", "vendor", "text", "XX科技有限公司")}
              {input("技术联系人", "tech_contact", "text", "李四")}
              {input("联系电话", "tech_phone", "text", "13800138000")}
            </div>

            {textarea("系统描述", "description", "系统用途和主要功能描述...")}
            {textarea("备注", "notes", "其他需要说明的信息...")}

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-[#1e4a8c] text-white font-medium hover:bg-[#153a70] transition-colors">
                {editingId ? "保存修改" : "提交备案"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f3f4f8] transition-colors">
                取消
              </button>
            </div>

          </div>
        )}

        {/* Server Management Panel */}
        {managingServerId && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#0f172a]">管理服务器</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">所属系统：{managingServerName}</p>
              </div>
              <button
                onClick={closeServerManage}
                className="px-4 py-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-sm hover:bg-[#f3f4f8] transition-colors"
              >
                关闭
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
                服务器清单 ({servers.length} 台)
              </h4>
              <button
                onClick={() => { resetServerForm(); setShowServerForm(!showServerForm); }}
                className="px-4 py-1.5 rounded-lg bg-[#1e4a8c] text-white text-xs font-medium hover:bg-[#153a70] transition-colors"
              >
                {showServerForm ? "取消" : "+ 添加服务器"}
              </button>
            </div>

            {showServerForm && (
              <div className="bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl p-4 mb-4 space-y-3">
                <h5 className="text-sm font-semibold text-[#0f172a]">
                  {editingServerId ? "编辑服务器" : "新增服务器"}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">IP 地址 *</label>
                    <input
                      type="text"
                      value={serverForm.ip_address}
                      onChange={(e) => setServerForm({ ...serverForm, ip_address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">操作系统</label>
                    <input
                      type="text"
                      value={serverForm.os}
                      onChange={(e) => setServerForm({ ...serverForm, os: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="CentOS 7 / Ubuntu 22.04 / Windows Server 2019"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">中间件</label>
                    <input
                      type="text"
                      value={serverForm.middleware}
                      onChange={(e) => setServerForm({ ...serverForm, middleware: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="Nginx / Tomcat / IIS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">数据库</label>
                    <input
                      type="text"
                      value={serverForm.db_type}
                      onChange={(e) => setServerForm({ ...serverForm, db_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="MySQL / PostgreSQL / SQL Server"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">CPU / 内存</label>
                    <input
                      type="text"
                      value={serverForm.cpu_memory}
                      onChange={(e) => setServerForm({ ...serverForm, cpu_memory: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="8核 / 32GB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">硬盘</label>
                    <input
                      type="text"
                      value={serverForm.disk}
                      onChange={(e) => setServerForm({ ...serverForm, disk: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="500GB SSD"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">机房位置</label>
                    <input
                      type="text"
                      value={serverForm.location}
                      onChange={(e) => setServerForm({ ...serverForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="信息中心机房 A区"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#475569] mb-1">用途</label>
                    <input
                      type="text"
                      value={serverForm.purpose}
                      onChange={(e) => setServerForm({ ...serverForm, purpose: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm"
                      placeholder="应用服务器 / 数据库服务器"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#475569] mb-1">备注</label>
                  <textarea
                    value={serverForm.notes}
                    onChange={(e) => setServerForm({ ...serverForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] text-sm resize-none"
                    placeholder="其他说明..."
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveServer} className="px-5 py-1.5 rounded-lg bg-[#1e4a8c] text-white text-sm font-medium hover:bg-[#153a70] transition-colors">
                    {editingServerId ? "保存" : "添加"}
                  </button>
                  <button onClick={resetServerForm} className="px-5 py-1.5 rounded-lg border border-[#e2e8f0] text-[#0f172a] text-sm hover:bg-white transition-colors">
                    取消
                  </button>
                </div>
              </div>
            )}

            {servers.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">暂无服务器记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f3f4f8]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium text-xs">IP 地址</th>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium text-xs">操作系统</th>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium text-xs hidden sm:table-cell">中间件</th>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium text-xs hidden md:table-cell">数据库</th>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium text-xs hidden lg:table-cell">配置</th>
                      <th className="px-3 py-2 text-right text-[#475569] font-medium text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {servers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#f8f9fc]">
                        <td className="px-3 py-2 font-mono text-[#0f172a]">{s.ip_address}</td>
                        <td className="px-3 py-2 text-[#475569]">{s.os || "—"}</td>
                        <td className="px-3 py-2 text-[#475569] hidden sm:table-cell">{s.middleware || "—"}</td>
                        <td className="px-3 py-2 text-[#475569] hidden md:table-cell">{s.db_type || "—"}</td>
                        <td className="px-3 py-2 text-[#475569] hidden lg:table-cell">{s.cpu_memory || "—"}</td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button onClick={() => startEditServer(s)} className="text-[#1e4a8c] hover:underline text-xs font-medium">编辑</button>
                          <button onClick={() => handleDeleteServer(s.id)} className="text-red-500 hover:underline text-xs">删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Records Table */}
        {loading ? (
          <div className="text-center py-12 text-[#94a3b8]">加载中...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8]">暂无备案记录</div>
        ) : (
          <div className="space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#f3f4f8]">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={pagedRecords.length > 0 && pagedRecords.every((r) => selectedIds.has(r.id))}
                      onChange={toggleSelectAll}
                      className="rounded border-[#cbd5e1] text-[#1e4a8c] focus:ring-[#1e4a8c]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[#475569] font-medium">系统名称</th>
                  <th className="px-4 py-3 text-left text-[#475569] font-medium hidden sm:table-cell">负责人</th>
                  <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">部门</th>
                  <th className="px-4 py-3 text-left text-[#475569] font-medium">状态</th>
                  <th className="px-4 py-3 text-left text-[#475569] font-medium hidden md:table-cell">备案编号</th>
                  <th className="px-4 py-3 text-right text-[#475569] font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {pagedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#f8f9fc]">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(record.id)}
                        onChange={() => toggleSelectRow(record.id)}
                        className="rounded border-[#cbd5e1] text-[#1e4a8c] focus:ring-[#1e4a8c]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#0f172a] font-medium">{record.name}</div>
                      {record.domain && <div className="text-xs text-[#94a3b8] mt-0.5">{record.domain}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#475569] hidden sm:table-cell">{record.owner_name || "—"}</td>
                    <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{record.owner_dept || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${record.status === "已备案" ? "status-done" : record.status === "待备案" ? "status-pending" : "status-none"}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#475569] hidden md:table-cell">{record.beian_no || "—"}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openServerManage(record)} className="text-[#10b981] hover:underline text-xs font-medium">服务器</button>
                      <button onClick={() => startEdit(record)} className="text-[#1e4a8c] hover:underline text-xs font-medium">编辑</button>
                      <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:underline text-xs">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
              <span>共 {filteredRecords.length} 条记录，第 {currentPage} / {pagedTotalPages} 页</span>
              <div className="flex items-center gap-1">
                <span>每页</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 rounded border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#1e4a8c]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>条</span>
              </div>
            </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e2e8f0] text-[#475569] hover:bg-[#f3f4f8] transition-colors disabled:text-[#94a3b8] disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: pagedTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      p === currentPage
                        ? "bg-[#1e4a8c] text-white"
                        : "text-[#475569] hover:bg-[#f3f4f8]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagedTotalPages, p + 1))}
                  disabled={currentPage >= pagedTotalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e2e8f0] text-[#475569] hover:bg-[#f3f4f8] transition-colors disabled:text-[#94a3b8] disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
