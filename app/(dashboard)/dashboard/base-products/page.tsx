import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BaseProductsCatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos Base</h1>
        <p className="text-muted-foreground">Visualize informações nutricionais por 100g/unidade</p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.category && (
                  <CardDescription>
                    <Badge variant="secondary">{product.category.name}</Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
                {product.measurement_unit && (
                  <p className="text-sm">Unidade: {product.measurement_unit.abbreviation}</p>
                )}
                {product.nutritional_info ? (
                  <div className="text-sm">
                    <p className="font-medium">Informações Nutricionais (por 100 {product.measurement_unit?.abbreviation || "g"}):</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>Calorias: {product.nutritional_info.calories ?? 0} kcal</li>
                      <li>Proteínas: {product.nutritional_info.protein ?? 0} g</li>
                      <li>Carboidratos: {product.nutritional_info.carbohydrates ?? 0} g</li>
                      <li>Gorduras Totais: {product.nutritional_info.total_fat ?? 0} g</li>
                      {product.nutritional_info.fiber != null && (
                        <li>Fibras: {product.nutritional_info.fiber} g</li>
                      )}
                      {product.nutritional_info.sodium != null && (
                        <li>Sódio: {product.nutritional_info.sodium} mg</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem informações nutricionais</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum produto base ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cadastre produtos base na área administrativa.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

