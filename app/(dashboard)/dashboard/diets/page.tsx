import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import DietList from "@/components/diet/DietList";

export default async function DietsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: diets } = await supabase
    .from("diets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Dietas</h1>
          <p className="text-muted-foreground">
            Gerencie suas dietas e refeições
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/diets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Dieta
          </Link>
        </Button>
      </div>

      <DietList diets={diets || []} />
    </div>
  );
}

