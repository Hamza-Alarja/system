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
import { ArrowLeft, Users, Loader2 } from "lucide-react";

type Showroom = {
  id: string;
  name: string;
};

export function AddEmployeePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const res = await fetch("/api/showrooms");
        const data = await res.json();
        setShowrooms(data.showrooms || []);
      } catch (error) {
        console.error("فشل تحميل المعارض:", error);
      }
    };
    fetchShowrooms();
  }, []);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      showroomId: "", // 👈 لأن النوع رقمي
      salary: 0, // 👈 لأن النوع رقمي
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);

    try {
      // تحويل showroomId و salary لنوع number
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        showroomId: data.showroomId,
        salary: Number(data.salary),
      };

      console.log("إرسال البيانات:", payload);

      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData); // أضف هذا

        throw new Error(errorData.error || "فشل في إنشاء المستخدم");
      }

      toast({
        title: "تم إنشاء الموظف بنجاح",
        variant: "success",
      });

      router.push("/dashboard/employees");
    } catch (error) {
      toast({
        title: "فشل في إنشاء الموظف",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/employees")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة موظف جديد</h1>
          <p className="text-muted-foreground">
            إضافة موظف جديد إلى المعارض الخاصة بك
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            تفاصيل الموظف
          </CardTitle>
          <CardDescription>أدخل تفاصيل الموظف الجديد</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* البريد الإلكتروني */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* كلمة المرور */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* اسم الموظف */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموظف</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الموظف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الدور */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        console.log("الدور المختار:", value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">موظف</SelectItem>
                        <SelectItem value="accountant">محاسب</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={field.value || ""}
                      onValueChange={(value) => {
                        console.log("المعرض المختار:", value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر معرض" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {showrooms.map((showroom) => (
                          <SelectItem key={showroom.id} value={showroom.id}>
                            {showroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الراتب */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الشهري</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل الراتب الشهري"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الأزرار */}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/employees")}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  إضافة موظف
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
