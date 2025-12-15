"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface BaseProductsCatalogProps {
  products: any[];
  defaultQuery?: string;
}

export default function BaseProductsCatalog({ products, defaultQuery }: BaseProductsCatalogProps) {
  const [term, setTerm] = React.useState(defaultQuery || "");
  const [openById, setOpenById] = React.useState<Record<string, boolean>>({});
  const [nutritionById, setNutritionById] = React.useState<Record<string, any>>({});
  const supabase = React.useMemo(() => createClient(), []);

  const filtered = React.useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => (p?.name || "").toLowerCase().includes(t));
  }, [products, term]);

  const handleToggle = async (product: any) => {
    const next = !openById[product.id];
    setOpenById((prev) => ({ ...prev, [product.id]: next }));
    const hasLocal = !!(Array.isArray(product.nutritional_info)
      ? product.nutritional_info[0]
      : product.nutritional_info);
    if (next && !hasLocal && !nutritionById[product.id]) {
      const { data, error } = await supabase
        .from("nutritional_info")
        .select("*")
        .eq("product_base_id", product.id)
        .maybeSingle();
      let row = data as any | null;
      if (!row) {
        const { data: rows } = await supabase
          .from("nutritional_info")
          .select("*")
          .eq("product_base_id", product.id)
          .limit(1);
        row = rows && rows.length > 0 ? rows[0] : null;
      }
      if (row) {
        setNutritionById((prev) => ({ ...prev, [product.id]: row }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar produto..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && term.length > 0 && (
          <Button variant="ghost" onClick={() => setTerm("")}>Limpar</Button>
        )}
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product: any) => (
            <Card
              key={product.id}
              className="cursor-pointer"
              onClick={() => handleToggle(product)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleToggle(product);
              }}
              tabIndex={0}
            >
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.category && (
                  <div className="mt-1">
                    <Badge variant="secondary">{product.category.name}</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {product.measurement_unit && (
                  <p className="text-sm">Unidade: {product.measurement_unit.abbreviation}</p>
                )}
                {openById[product.id] ? (
                  (() => {
                    const ni = Array.isArray(product.nutritional_info)
                      ? product.nutritional_info[0]
                      : product.nutritional_info || nutritionById[product.id];
                    return ni ? (
                    <div className="text-sm">
                      <p className="font-medium">Informações Nutricionais (por 100 {product.measurement_unit?.abbreviation || "g"}):</p>
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
                      <p className="text-sm text-muted-foreground">Sem informações nutricionais</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Clique para ver informações nutricionais</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
      )}
    </div>
  );
}
