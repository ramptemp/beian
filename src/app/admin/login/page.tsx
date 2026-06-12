"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      document.cookie = `admin_token=${data.token}; path=/; max-age=604800`;
      router.push("/admin/dashboard");
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] px-4">
      <div className="w-full max-w-sm bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e4a8c] flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">
            备案
          </div>
          <h1 className="text-xl font-bold text-[#0f172a]">信息系统备案管理</h1>
          <p className="text-sm text-[#94a3b8] mt-1">管理后台登录</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#475569] mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] transition-colors"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#1e4a8c] transition-colors"
              placeholder="admin123"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#1e4a8c] text-white font-medium hover:bg-[#153a70] transition-colors disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
