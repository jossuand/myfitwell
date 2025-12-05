import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductBaseList from "@/components/admin/ProductBaseList";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é admin
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const { data: products } = await supabase
    .from("product_bases")
    .select(`
      *,
      category:product_categories(*),
      measurement_unit:measurement_units(*),
      nutritional_info(*)
    `)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos Base</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos genéricos do sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {products && products.length > 0 ? (
        <ProductBaseList products={products} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum produto cadastrado</CardTitle>
            <CardDescription>
              Comece adicionando produtos base ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Produto
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

