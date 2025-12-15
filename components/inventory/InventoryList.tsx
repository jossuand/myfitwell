"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface InventoryItem {
  id: string;
  quantity: number;
  expiration_date: string | null;
  storage_location: string | null;
  status: string;
  product_base: { name: string } | null;
  user_product: {
    custom_name: string | null;
    product_base: { name: string } | null;
  } | null;
  measurement_unit: { abbreviation: string } | null;
}

interface InventoryListProps {
  inventory: InventoryItem[];
}

export default function InventoryList({ inventory }: InventoryListProps) {
  const supabase = createClient();
  const router = useRouter();
  const [userProducts, setUserProducts] = React.useState<any[]>([]);
  const [productBases, setProductBases] = React.useState<any[]>([]);
  const [units, setUnits] = React.useState<any[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [selectedProductKind, setSelectedProductKind] = React.useState<"user" | "base" | null>(null);
  const [unitId, setUnitId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<string>("");
  const [expirationDate, setExpirationDate] = React.useState<string>("");
  const [storageLocation, setStorageLocation] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("available");
  const [openEditByItem, setOpenEditByItem] = React.useState<Record<string, boolean>>({});
  const [quantityEditByItem, setQuantityEditByItem] = React.useState<Record<string, string>>({});
  const [unitIdEditByItem, setUnitIdEditByItem] = React.useState<Record<string, string>>({});
  const [expirationEditByItem, setExpirationEditByItem] = React.useState<Record<string, string>>({});
  const [storageEditByItem, setStorageEditByItem] = React.useState<Record<string, string>>({});
  const [statusEditByItem, setStatusEditByItem] = React.useState<Record<string, string>>({});
  const statusLabel: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservado",
    expired: "Vencido",
    consumed: "Consumido",
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: up }, { data: pb }, { data: un }] = await Promise.all([
        supabase
          .from("user_products")
          .select("*, measurement_unit:measurement_units(id, abbreviation), product_base:product_bases(*, measurement_unit:measurement_units(id, abbreviation))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("product_bases")
          .select("*, measurement_unit:measurement_units(id, abbreviation)")
          .order("name"),
        supabase.from("measurement_units").select("*").eq("is_active", true).order("name"),
      ]);
      if (!mounted) return;
      setUserProducts(up || []);
      setProductBases(pb || []);
      setUnits(un || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveRow = async () => {
    if (!selectedProductId) {
      alert("Selecione um produto");
      return;
    }
    if (!unitId) {
      alert("Selecione a unidade");
      return;
    }
    if (!quantity || isNaN(Number(quantity))) {
      alert("Informe a quantidade");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }
    const payload: any = {
      user_id: user.id,
      measurement_unit_id: unitId,
      quantity: parseFloat(quantity),
      expiration_date: expirationDate || null,
      storage_location: storageLocation || null,
      status: status || "available",
    };
    if (selectedProductKind === "user") {
      payload.user_product_id = selectedProductId;
    } else if (selectedProductKind === "base") {
      payload.product_base_id = selectedProductId;
    }
    const { error: insertError } = await supabase
      .from("inventory")
      .insert(payload);
    if (insertError) {
      alert(insertError.message);
      return;
    }
    setShowForm(false);
    setSelectedProductId(null);
    setSelectedProductKind(null);
    setSearchTerm("");
    setUnitId("");
    setQuantity("");
    setExpirationDate("");
    setStorageLocation("");
    setStatus("available");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Adicionar Item"}
        </Button>
      </div>

      {showForm && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Produto</th>
                <th className="p-2">Quantidade</th>
                <th className="p-2">Unidade</th>
                <th className="p-2">Validade</th>
                <th className="p-2">Local</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-muted/30">
                <td className="p-2 align-top">
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar produto..."
                      value={searchTerm}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSearchTerm(v);
                        // se havia um produto selecionado e o usuário alterou/limpou o texto,
                        // liberamos novamente a busca
                        if (selectedProductId) {
                          setSelectedProductId(null);
                          setSelectedProductKind(null);
                        }
                      }}
                    />
                    {(() => {
                      const term = searchTerm.trim().toLowerCase();
                      if (selectedProductId || term.length === 0) return null;
                      const userOptions = (userProducts || [])
                        .filter((up) => {
                          const label = up.custom_name || up.product_base?.name || up.id;
                          return label?.toLowerCase().includes(term);
                        })
                        .map((up) => ({ id: up.id, label: up.custom_name || up.product_base?.name || up.id, kind: "user" as const, muId: up?.measurement_unit?.id || up?.product_base?.measurement_unit?.id || null }));
                      const baseOptions = (productBases || [])
                        .filter((pb) => pb.name?.toLowerCase().includes(term))
                        .map((pb) => ({ id: pb.id, label: pb.name, kind: "base" as const, muId: pb?.measurement_unit?.id || null }));
                      const options = [...baseOptions, ...userOptions].slice(0, 50);
                      return (
                        <div className="max-h-40 overflow-auto rounded border bg-background">
                          {options.length > 0 ? (
                            options.map((opt) => (
                              <button
                                key={`${opt.kind}-${opt.id}`}
                                className="flex w-full cursor-pointer items-center justify-between px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  setSelectedProductId(opt.id);
                                  setSelectedProductKind(opt.kind);
                                  setSearchTerm(opt.label);
                                  setUnitId(opt.muId || "");
                                }}
                              >
                                <span>{opt.label}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-muted-foreground">Nenhum resultado</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qtd"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </td>
                <td className="p-2 align-top">
                  <Select value={unitId} onValueChange={(v) => setUnitId(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.abbreviation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 align-top">
                  <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                </td>
                <td className="p-2 align-top">
                  <Input placeholder="Local" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} />
                </td>
                <td className="p-2 align-top">
                  <Select value={status} onValueChange={(v) => setStatus(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="reserved">Reservado</SelectItem>
                      <SelectItem value="expired">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 align-top">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveRow}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {inventory.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Estoque vazio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Adicione produtos ao seu estoque</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Produto</th>
              <th className="p-2">Quantidade</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Validade</th>
              <th className="p-2">Local</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const productName =
                item.user_product?.custom_name ||
                item.product_base?.name ||
                item.user_product?.product_base?.name ||
                "Produto";
              const isExpiring =
                item.expiration_date &&
                new Date(item.expiration_date) <=
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              const qtyStr = quantityEditByItem[item.id] ?? String(item.quantity ?? "");
              const unitIdStr = unitIdEditByItem[item.id] ?? (item as any).measurement_unit?.id ?? "";
              const expStr = expirationEditByItem[item.id] ?? (item.expiration_date || "");
              const locStr = storageEditByItem[item.id] ?? (item.storage_location || "");
              const statusStr = statusEditByItem[item.id] ?? (item.status || "available");
              return (
                <React.Fragment key={item.id}>
                <tr className="border-t">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-primary" />
                      <span className="font-medium">{productName}</span>
                      {isExpiring && (
                        <Badge variant="destructive" className="ml-2">Vencendo</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{item.measurement_unit?.abbreviation || ""}</td>
                  <td className="p-2">
                    {item.expiration_date
                      ? new Date(item.expiration_date).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="p-2">{item.storage_location || "-"}</td>
                  <td className="p-2">
                    <Badge variant="secondary">{statusLabel[item.status] || item.status}</Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Editar"
                        aria-label="Editar"
                        className="px-1"
                        onClick={() =>
                          setOpenEditByItem((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Excluir"
                        aria-label="Excluir"
                        className="px-1"
                        onClick={async () => {
                          if (!confirm("Remover este item do estoque?")) return;
                          const { error } = await supabase
                            .from("inventory")
                            .delete()
                            .eq("id", item.id);
                          if (error) {
                            alert(error.message);
                            return;
                          }
                          router.refresh();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {openEditByItem[item.id] ? (
                  <tr className="bg-muted/30">
                    <td className="p-2" colSpan={7}>
                      <div className="grid gap-3 md:grid-cols-5">
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Qtd"
                            value={qtyStr}
                            onChange={(e) => setQuantityEditByItem((p) => ({ ...p, [item.id]: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Select
                            value={unitIdStr}
                            onValueChange={(v) => setUnitIdEditByItem((p) => ({ ...p, [item.id]: v }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.abbreviation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={expStr}
                            onChange={(e) => setExpirationEditByItem((p) => ({ ...p, [item.id]: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Local"
                            value={locStr}
                            onChange={(e) => setStorageEditByItem((p) => ({ ...p, [item.id]: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Select
                            value={statusStr}
                            onValueChange={(v) => setStatusEditByItem((p) => ({ ...p, [item.id]: v }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Disponível</SelectItem>
                              <SelectItem value="reserved">Reservado</SelectItem>
                              <SelectItem value="expired">Vencido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const qty = parseFloat(quantityEditByItem[item.id] ?? String(item.quantity));
                            if (isNaN(qty)) {
                              alert("Informe a quantidade válida");
                              return;
                            }
                            const unitSel = unitIdEditByItem[item.id] ?? (item as any).measurement_unit?.id;
                            const { error } = await supabase
                              .from("inventory")
                              .update({
                                quantity: qty,
                                measurement_unit_id: unitSel || null,
                                expiration_date: expirationEditByItem[item.id] || null,
                                storage_location: storageEditByItem[item.id] || null,
                                status: statusEditByItem[item.id] || item.status,
                              })
                              .eq("id", item.id);
                            if (error) {
                              alert(error.message);
                              return;
                            }
                            setOpenEditByItem((p) => ({ ...p, [item.id]: false }));
                            router.refresh();
                          }}
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenEditByItem((p) => ({ ...p, [item.id]: false }))}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
