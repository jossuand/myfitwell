import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ShoppingListForm from "@/components/forms/ShoppingListForm";

export default async function NewShoppingListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Lista de Compras</h1>
        <p className="text-muted-foreground">Defina o nome da lista</p>
      </div>
      <ShoppingListForm />
    </div>
  );
}
