import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import InventoryList from "@/components/inventory/InventoryList";

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: inventory } = await supabase
    .from("inventory")
    .select(`
      *,
      user_product:user_products(
        *,
        product_base:product_bases(*)
      ),
      measurement_unit:measurement_units(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque dos seus produtos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao Estoque
          </Link>
        </Button>
      </div>

      <InventoryList inventory={inventory || []} />
    </div>
  );
}

