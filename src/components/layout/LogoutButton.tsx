"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
    >
      Sair
    </button>
  );
}