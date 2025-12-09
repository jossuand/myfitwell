import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UtensilsCrossed, ShoppingCart, Target, CalendarDays, ChevronRight } from "lucide-react";


export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar dados do perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Buscar dieta ativa
  const { data: activeDiet } = await supabase
    .from("diets")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

    let meals: any[] = [];
  if (activeDiet) {
    const { data: dietMeals } = await supabase
      .from("meals")
      .select(`
        *,
        diet_items(
          *,
          product_base:product_bases(
            *,
            measurement_unit:measurement_units(*),
            nutritional_info(*)
          ),
          user_product:user_products(
            *,
            product_base:product_bases(
              *,
              measurement_unit:measurement_units(*),
              nutritional_info(*)
            ),
            user_nutritional_info:user_product_nutritional_info(
              *,
              reference_unit:measurement_units(*)
            )
          ),
          measurement_unit:measurement_units(*)
        )
      `)
      .eq("diet_id", activeDiet.id)
      .order("meal_order");
    meals = dietMeals || [];
  }

  const { data: shoppingLists } = await supabase
    .from("shopping_lists")
    .select(`
      *,
      shopping_list_items(
        *,
        product_base:product_bases(*),
        user_product:user_products(*),
        measurement_unit:measurement_units(*)
      )
    `)
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .order("created_at", { ascending: false });

  const pendingList = (shoppingLists || [])[0] || null;
  const pendingItems = pendingList
    ? (pendingList.shopping_list_items || []).filter((it: any) => !it.is_purchased)
    : [];

  const todayLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date());
  const mealLabels: Record<string, string> = {
    breakfast: "Café da Manhã",
    morning_snack: "Lanche da Manhã",
    lunch: "Almoço",
    afternoon_snack: "Lanche da Tarde",
    dinner: "Jantar",
    supper: "Ceia",
    pre_workout: "Pré-Treino",
    post_workout: "Pós-Treino",
  };
  const targetCalories = activeDiet?.target_calories != null ? Number(activeDiet.target_calories) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {profile?.full_name || "Usuário"}!</h1>
        <p className="text-muted-foreground">Seu dia em foco</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-orange-100 p-2 text-orange-600">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Dieta de hoje</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3" />
                    {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
                  </CardDescription>
                </div>
              </div>
              {targetCalories != null && (
                <Badge variant="secondary" className="font-medium">Meta: {Math.round(targetCalories)} kcal</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeDiet ? (
              <>
                {meals.length > 0 ? (
                  meals.map((meal) => (
                    <div key={meal.id} className="mt-3 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{meal.name || mealLabels[meal.meal_type] || meal.meal_type}</p>
                        <Badge variant="outline" className="text-xs">{(meal.diet_items || []).length} itens</Badge>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {(meal.diet_items || []).map((item: any) => (
                          <li key={item.id} className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3" />
                            <span>
                              {item.quantity} {item.measurement_unit?.abbreviation || ""} • {item.product_base?.name || item.user_product?.custom_name || item.user_product?.product_base?.name || "Produto"}
                              {item.preparation_notes ? ` (${item.preparation_notes})` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sem refeições nesta dieta</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma dieta ativa</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-sky-100 p-2 text-sky-600">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Lista de compras pendente</CardTitle>
                  <CardDescription>{pendingList ? pendingList.name : "Nenhuma lista pendente"}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-medium">{pendingItems.length} itens</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingList ? (
              <>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {pendingItems.length > 0 ? pendingItems.map((it: any) => (
                    <li key={it.id} className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <span>{it.quantity} {it.measurement_unit?.abbreviation || ""} • {it.product_base?.name || it.user_product?.custom_name || it.user_product?.product_base?.name || "Produto"}</span>
                    </li>
                  )) : <p>Nenhum item pendente</p>}
                </ul>
                <div className="mt-3">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/shopping-lists">Ver todas as listas</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Nenhuma lista de compras pendente</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
