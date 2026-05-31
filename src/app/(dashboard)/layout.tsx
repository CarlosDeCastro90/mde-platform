import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIAssistant from "@/components/ai/AIAssistant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-lg">MDE Platform</span>
              </a>
              <div className="hidden sm:flex items-center gap-1">
                <a href="/dashboard" className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">Dashboard</a>
                <a href="/projects" className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">Projectos</a>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors">
                Sair
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}