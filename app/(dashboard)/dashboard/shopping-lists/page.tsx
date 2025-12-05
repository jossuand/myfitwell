import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import ShoppingListList from "@/components/shopping/ShoppingListList";

export default async function ShoppingListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lists } = await supabase
    .from("shopping_lists")
    .select(`
      *,
      shopping_list_items(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listas de Compras</h1>
          <p className="text-muted-foreground">
            Gerencie suas listas de compras
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shopping-lists/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Lista
          </Link>
        </Button>
      </div>

      <ShoppingListList lists={lists || []} />
    </div>
  );
}

