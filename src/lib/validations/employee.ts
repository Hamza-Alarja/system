import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("البريد غير صالح"),
  password: z.string().min(6, "كلمة المرور قصيرة جداً"),
  role: z.enum(["employee", "accountant"]),
showroomId: z.string().min(1, "اختر معرضًا"),  salary: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "الراتب مطلوب")
  ),
});
export type EmployeeFormData = z.infer<typeof employeeSchema>;
