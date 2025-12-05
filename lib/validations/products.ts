import { z } from "zod";

export const productBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category_id: z.string().uuid().optional().or(z.literal("")),
  measurement_unit_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  taco_code: z.string().optional(),
});

export const nutritionalInfoSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  total_fat: z.number().min(0).optional(),
  saturated_fat: z.number().min(0).optional(),
  trans_fat: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  calcium: z.number().min(0).optional(),
  iron: z.number().min(0).optional(),
  magnesium: z.number().min(0).optional(),
  potassium: z.number().min(0).optional(),
  zinc: z.number().min(0).optional(),
  vitamin_a: z.number().min(0).optional(),
  vitamin_b1: z.number().min(0).optional(),
  vitamin_b2: z.number().min(0).optional(),
  vitamin_b3: z.number().min(0).optional(),
  vitamin_b6: z.number().min(0).optional(),
  vitamin_b12: z.number().min(0).optional(),
  vitamin_c: z.number().min(0).optional(),
  vitamin_d: z.number().min(0).optional(),
  vitamin_e: z.number().min(0).optional(),
  vitamin_k: z.number().min(0).optional(),
  cholesterol: z.number().min(0).optional(),
});

export type ProductBaseInput = z.infer<typeof productBaseSchema>;
export type NutritionalInfoInput = z.infer<typeof nutritionalInfoSchema>;

