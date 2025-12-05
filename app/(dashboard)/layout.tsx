import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Refresh session primeiro
  await supabase.auth.getSession();

  // Obter usuário
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    if (process.env.NODE_ENV === "development") {
      console.log("DashboardLayout: No user, redirecting", {
        userError: userError?.message,
      });
    }
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

