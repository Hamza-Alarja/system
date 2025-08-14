"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/transaction";
import { useAppStore } from "@/store/app";
import { Loader2 } from "lucide-react";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: "salary" | "sales" | "custody" | "expense" | "deduction";
  employees: Array<{
    id: string; // تأكد أن هذا UUID وليس رقم
    name: string;
    showroomId?: string;
  }>;
  showrooms: Array<{ id: string; name: string }>; // تأكد أن هذا UUID وليس رقم
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transactionType,
  employees,
  showrooms,
}: TransactionFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addTransaction } = useAppStore();
  const { toast } = useToast();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transactionType,
      amount: "",
      description: "",
      employeeId: undefined,
      showroomId: undefined,
    },
  });

  const selectedShowroomId = form.watch("showroomId");

  useEffect(() => {
    form.setValue("employeeId", undefined);
  }, [selectedShowroomId, form]);

  const filteredEmployees = useMemo(() => {
    if (!selectedShowroomId) return [];
    return employees.filter(
      (e) => e.showroomId && e.showroomId === selectedShowroomId
    );
  }, [employees, selectedShowroomId]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        type: transactionType,
        amount: Number(data.amount),
        employeeId: data.employeeId || null,
        showroomId: data.showroomId || null,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("فشل في حفظ المعاملة");

      const newTransaction = await res.json();

      toast({
        title: "تم تسجيل المعاملة",
        description: `تمت إضافة معاملة ${transactionType} بنجاح`,
      });

      form.reset({
        type: transactionType,
        amount: "",
        description: "",
        employeeId: undefined,
        showroomId: undefined,
      });

      onOpenChange(false);
      addTransaction(newTransaction);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "خطأ",
        description: "فشل تسجيل المعاملة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader></DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* المبلغ */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل المبلغ"
                      type="number"
                      step="0.01"
                      className="no-spinner"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الوصف */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل وصف المعاملة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* اختيار المعرض */}
            <FormField
              control={form.control}
              name="showroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المعرض</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      value === "none"
                        ? field.onChange(null)
                        : field.onChange(value)
                    }
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {showrooms.find((s) => s.id === field.value)?.name ??
                            "اختر معرضًا"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {showrooms.length === 0 ? (
                        <SelectItem value="none" disabled>
                          لا توجد معارض
                        </SelectItem>
                      ) : (
                        showrooms.map((showroom) => (
                          <SelectItem key={showroom.id} value={showroom.id}>
                            {showroom.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* اختيار الموظف للرواتب والخصومات */}
            {transactionType !== "expense" && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        value === "none"
                          ? field.onChange(null)
                          : field.onChange(value)
                      }
                      value={field.value ?? ""}
                      disabled={
                        !selectedShowroomId || filteredEmployees.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedShowroomId
                                ? "اختر معرضًا أولاً"
                                : filteredEmployees.length === 0
                                ? "لا يوجد موظفين في هذا المعرض"
                                : "اختر موظفًا"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredEmployees.length === 0 ? (
                          <SelectItem value="none" disabled>
                            {!selectedShowroomId
                              ? "اختر معرضًا أولاً"
                              : "لا يوجد موظفين في هذا المعرض"}
                          </SelectItem>
                        ) : (
                          filteredEmployees
                            .filter((employee) => !!employee.id)
                            .map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-row-reverse space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                )}
                تسجيل المعاملة
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
