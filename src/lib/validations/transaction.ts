import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["salary", "sales", "custody", "expense", "deduction"]),
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().optional(),
  employeeId: z.string().optional(),
  showroomId: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;