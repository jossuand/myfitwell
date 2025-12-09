import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BaseProductsCatalog from "@/components/catalog/BaseProductsCatalog";

export default async function BaseProductsCatalogPage(
  props: { searchParams?: Promise<{ q?: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (isAdmin) {
    redirect("/dashboard/admin/products");
  }

  const { q } = (await props.searchParams) || {};
  let query = supabase
    .from("product_bases")
    .select(`
      *,
      category:product_categories(*),
      measurement_unit:measurement_units(*),
      nutritional_info(*)
    `)
    .eq("is_active", true)
    .order("name");
  if (q && q.trim().length > 0) {
    query = query.ilike("name", `%${q}%`);
  }
  const { data: products } = await query;
  const ids = (products || []).map((p: any) => p.id);
  let productsWithNutrition = products || [];
  if (ids.length > 0) {
    const { data: nutritionRows } = await supabase
      .from("nutritional_info")
      .select("*")
      .in("product_base_id", ids);
    const nmap = Object.fromEntries(
      (nutritionRows || []).map((row: any) => [row.product_base_id, row])
    );
    productsWithNutrition = (products || []).map((p: any) => ({
      ...p,
      nutritional_info: nmap[p.id] || p.nutritional_info || null,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos Base</h1>
        <p className="text-muted-foreground">Visualize informações nutricionais por 100g/unidade</p>
      </div>
      <BaseProductsCatalog products={productsWithNutrition} defaultQuery={q || ""} />
    </div>
  );
}
