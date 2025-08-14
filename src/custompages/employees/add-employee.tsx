"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  employeeSchema,
  type EmployeeFormData,
} from "@/lib/validations/employee";
import { Users, Loader2 } from "lucide-react";

type Showroom = {
  id: string;
  name: string;
};

export function AddEmployeePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const res = await fetch("/api/showrooms");
        if (!res.ok) throw new Error("فشل تحميل المعارض");
        const data = await res.json();
        setShowrooms(data.showrooms || []);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل قائمة المعارض",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchShowrooms();
  }, [toast]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      showroomId: "",
      salary: 0,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);

    try {
      const payload = {
        ...data,
        showroomId: data.showroomId,
        salary: Number(data.salary),
      };

      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في إنشاء الموظف");
      }

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الموظف بنجاح",
      });

      router.push("/dashboard/employees");
    } catch (error) {
      toast({
        title: "خطأ",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl">
      <div>
        <Card className="border-0 ">
          <CardHeader>
            <div className="flex items-center gap-1">
              <div className="p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  تفاصيل الموظف
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  الرجاء تعبئة جميع الحقول المطلوبة
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-2">
                  {/* اسم الموظف */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          اسم الموظف
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل الاسم الكامل"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* البريد الإلكتروني */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@email.com"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* كلمة المرور */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          كلمة المرور
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* الدور */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                          الدور الوظيفي
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white justify-end">
                              <SelectValue placeholder="اختر الدور" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employee">موظف</SelectItem>
                            <SelectItem value="accountant">محاسب</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* المعرض */}
                  <FormField
                    control={form.control}
                    name="showroomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          المعرض التابع له
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isFetching}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white justify-end">
                              <SelectValue
                                placeholder={
                                  isFetching
                                    ? "جاري تحميل المعارض..."
                                    : "اختر المعرض"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {showrooms.map((showroom) => (
                              <SelectItem key={showroom.id} value={showroom.id}>
                                {showroom.name}
                              </SelectItem>
                            ))}
                            {showrooms.length === 0 && !isFetching && (
                              <SelectItem value="" disabled>
                                لا توجد معارض متاحة
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* الراتب */}
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الراتب الشهري
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white pl-12 no-spinner"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/employees")}
                    className="px-5 py-2.5 rounded-lg border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "إضافة الموظف"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
