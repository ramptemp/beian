import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAllBeian, getAllServers, searchServers } from "@/lib/data";
import { verifyToken } from "@/lib/auth";
import TabSection from "./TabSection";

interface Props {
  searchParams?: Promise<{ ip?: string; beian_id?: string; os?: string; middleware?: string; db_type?: string; location?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  const allRecords = getAllBeian();
  const params = await searchParams;
  const ipFilter = params?.ip;
  const beianFilter = params?.beian_id ? Number(params.beian_id) : undefined;
  const osFilter = params?.os;
  const middlewareFilter = params?.middleware;
  const dbTypeFilter = params?.db_type;
  const locationFilter = params?.location;

  const hasServerFilter = ipFilter || beianFilter || osFilter || middlewareFilter || dbTypeFilter || locationFilter;
  const servers = hasServerFilter
    ? searchServers(ipFilter, beianFilter, osFilter, middlewareFilter, dbTypeFilter, locationFilter)
    : getAllServers();

  return (
    <>
      {/* Header */}
      <header className="bg-[#1e4a8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">学校信息系统备案管理平台</h1>
              <p className="text-sm text-[#dbeafe] mt-1">系统备案公示 · 信息安全管理</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="px-5 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                管理后台
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

      {/* Records + Servers Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabSection
          allRecords={allRecords}
          servers={servers}
          ipFilter={ipFilter}
          beianFilter={beianFilter}
          osFilter={osFilter}
          middlewareFilter={middlewareFilter}
          dbTypeFilter={dbTypeFilter}
          locationFilter={locationFilter}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e2e8f0] bg-[#f8f9fc] py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#94a3b8]">
          <p>学校信息系统备案管理平台 · 版权所有</p>
        </div>
      </footer>
    </>
  );
}
