import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const healthDataSchema = z.object({
  weight: z
    .number()
    .positive("Peso deve ser positivo")
    .max(500, "Peso inválido")
    .optional()
    .or(z.literal("")),
  height: z
    .number()
    .positive("Altura deve ser positiva")
    .max(3, "Altura inválida (em metros)")
    .optional()
    .or(z.literal("")),
  activity_level: z
    .enum(["sedentary", "light", "moderate", "intense", "very_intense"])
    .optional(),
  food_restrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  intolerances: z.array(z.string()).optional(),
  medical_conditions: z.array(z.string()).optional(),
});

export const healthHistorySchema = z.object({
  weight: z
    .number()
    .positive("Peso deve ser positivo")
    .max(500, "Peso inválido")
    .optional(),
  height: z
    .number()
    .positive("Altura deve ser positiva")
    .max(3, "Altura inválida (em metros)")
    .optional(),
  waist_circumference: z.number().positive().optional(),
  hip_circumference: z.number().positive().optional(),
  chest_circumference: z.number().positive().optional(),
  arm_circumference: z.number().positive().optional(),
  thigh_circumference: z.number().positive().optional(),
  notes: z.string().optional(),
  recorded_at: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type HealthDataInput = z.infer<typeof healthDataSchema>;
export type HealthHistoryInput = z.infer<typeof healthHistorySchema>;

