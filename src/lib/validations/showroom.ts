// src/lib/validations/showroom.ts
import { z } from "zod";

export const showroomSchema = z.object({
  name: z.string().min(2, "اسم المعرض مطلوب"),
  address: z.string().min(5, "العنوان قصير جداً"),
  
  managers: z.array(z.string().min(2)).optional(),
});

export type ShowroomFormData = z.infer<typeof showroomSchema>;
