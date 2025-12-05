import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, ShoppingCart, TrendingUp, Package } from "lucide-react";

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

  // Contar itens na lista de compras
  const { count: shoppingListCount } = await supabase
    .from("shopping_lists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {profile?.full_name || "Usuário"}!
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas dietas, estoque e compras em um só lugar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dieta Atual</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeDiet ? activeDiet.name : "Nenhuma"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeDiet
                ? `Objetivo: ${activeDiet.objective}`
                : "Crie sua primeira dieta"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.weight ? `${profile.weight} kg` : "Não informado"}
            </div>
            <p className="text-xs text-muted-foreground">
              IMC: {profile?.imc ? profile.imc.toFixed(1) : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lista de Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shoppingListCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Listas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/diets/new">
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Criar Nova Dieta
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/shopping-lists">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver Lista de Compras
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/inventory">
                <Package className="mr-2 h-4 w-4" />
                Gerenciar Estoque
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              Complete seu perfil para uma experiência personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!profile?.weight && (
              <p className="text-sm text-muted-foreground">
                • Adicione seu peso e altura no perfil
              </p>
            )}
            {!activeDiet && (
              <p className="text-sm text-muted-foreground">
                • Crie sua primeira dieta
              </p>
            )}
            {shoppingListCount === 0 && (
              <p className="text-sm text-muted-foreground">
                • Gere uma lista de compras baseada na sua dieta
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

