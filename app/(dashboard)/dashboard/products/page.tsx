import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import UserProductList from "@/components/products/UserProductList";

export default async function UserProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: products } = await supabase
    .from("user_products")
    .select(`
      *,
      product_base:product_bases(*),
      measurement_unit:measurement_units(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos com marca e preço
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <UserProductList products={products || []} />
    </div>
  );
}

