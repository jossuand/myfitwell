"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface UserProduct {
  id: string;
  brand: string | null;
  custom_name: string | null;
  price: number | null;
  quantity: number | null;
  store_name: string | null;
  product_base: { name: string } | null;
}

interface UserProductListProps {
  products: any[];
}

export default function UserProductList({ products }: UserProductListProps) {
  const [openById, setOpenById] = React.useState<Record<string, boolean>>({});
  const [nutritionById, setNutritionById] = React.useState<Record<string, any>>({});

  const toggle = async (product: any) => {
    const next = !openById[product.id];
    setOpenById((prev) => ({ ...prev, [product.id]: next }));
    const hasLocal = !!product.user_nutritional_info;
    const hasBase = !!(Array.isArray(product.product_base?.nutritional_info)
      ? product.product_base?.nutritional_info?.[0]
      : product.product_base?.nutritional_info);
    if (next && !hasLocal && !hasBase && !nutritionById[product.id]) {
      // Nenhuma info presente no payload, não busca extra para evitar políticas RLS; mantém fechado se não tiver
      return;
    }
  };
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum produto cadastrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comece adicionando produtos com marca e preço
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {product.custom_name || product.product_base?.name || "Produto"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {product.brand && (
              <p className="text-sm text-muted-foreground">Marca: {product.brand}</p>
            )}
            {product.price && (
              <p className="text-sm font-medium">R$ {product.price.toFixed(2)}</p>
            )}
            {product.store_name && (
              <p className="text-sm text-muted-foreground">Loja: {product.store_name}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggle(product)}
              >
                Ver Nutrição
              </Button>
            </div>

            {openById[product.id] ? (
              (() => {
                const niUser = product.user_nutritional_info || null;
                const niBase = Array.isArray(product.product_base?.nutritional_info)
                  ? product.product_base?.nutritional_info?.[0]
                  : product.product_base?.nutritional_info || null;
                const ni = niUser || niBase || nutritionById[product.id] || null;
                const refUnitAbbr = niUser?.reference_unit?.abbreviation || product.measurement_unit?.abbreviation || "g";
                return ni ? (
                  <div className="mt-3 rounded border p-3 text-sm">
                    <p className="font-medium">Informações Nutricionais (por 100 {refUnitAbbr}):</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>Calorias: {ni.calories ?? 0} kcal</li>
                      <li>Proteínas: {ni.protein ?? 0} g</li>
                      <li>Carboidratos: {ni.carbohydrates ?? 0} g</li>
                      <li>Gorduras Totais: {ni.total_fat ?? 0} g</li>
                      {ni.fiber != null && (<li>Fibras: {ni.fiber} g</li>)}
                      {ni.sugar != null && (<li>Açúcares: {ni.sugar} g</li>)}
                      {ni.sodium != null && (<li>Sódio: {ni.sodium} mg</li>)}
                      {ni.calcium != null && (<li>Cálcio: {ni.calcium} mg</li>)}
                      {ni.iron != null && (<li>Ferro: {ni.iron} mg</li>)}
                      {ni.magnesium != null && (<li>Magnésio: {ni.magnesium} mg</li>)}
                      {ni.potassium != null && (<li>Potássio: {ni.potassium} mg</li>)}
                      {ni.zinc != null && (<li>Zinco: {ni.zinc} mg</li>)}
                      {ni.vitamin_a != null && (<li>Vitamina A: {ni.vitamin_a} mcg</li>)}
                      {ni.vitamin_b1 != null && (<li>Vitamina B1: {ni.vitamin_b1} mg</li>)}
                      {ni.vitamin_b2 != null && (<li>Vitamina B2: {ni.vitamin_b2} mg</li>)}
                      {ni.vitamin_b3 != null && (<li>Vitamina B3: {ni.vitamin_b3} mg</li>)}
                      {ni.vitamin_b6 != null && (<li>Vitamina B6: {ni.vitamin_b6} mg</li>)}
                      {ni.vitamin_b12 != null && (<li>Vitamina B12: {ni.vitamin_b12} mcg</li>)}
                      {ni.vitamin_c != null && (<li>Vitamina C: {ni.vitamin_c} mg</li>)}
                      {ni.vitamin_d != null && (<li>Vitamina D: {ni.vitamin_d} mcg</li>)}
                      {ni.vitamin_e != null && (<li>Vitamina E: {ni.vitamin_e} mg</li>)}
                      {ni.vitamin_k != null && (<li>Vitamina K: {ni.vitamin_k} mcg</li>)}
                      {ni.cholesterol != null && (<li>Colesterol: {ni.cholesterol} mg</li>)}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Sem informações nutricionais</p>
                );
              })()
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
