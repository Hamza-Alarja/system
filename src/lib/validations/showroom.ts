import { z } from "zod";

export const showroomSchema = z.object({
  name: z.string().min(2, "اسم المعرض مطلوب"),
  address: z.string().min(2, "العنوان قصير جداً"),
  
});

export type ShowroomFormData = z.infer<typeof showroomSchema>;
