"use client";

import { useState } from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  showroomSchema,
  type ShowroomFormData,
} from "@/lib/validations/showroom";
import { Building2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMIRATES = [
  "أبو ظبي",
  "دبي",
  "الشارقة",
  "عجمان",
  "أم القيوين",
  "رأس الخيمة",
  "الفجيرة",
];

export function AddShowroomPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ShowroomFormData>({
    resolver: zodResolver(showroomSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = async (data: ShowroomFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-showroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          address: data.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Unknown error");
      }

      toast({
        title: "تم إنشاء المعرض بنجاح",
        description: "تم إضافة المعرض الجديد إلى قاعدة البيانات",
      });

      router.push("/dashboard/showrooms");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المعرض. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col space-y-6">
        <Card className="w-full rounded-xl border-0 dark:border dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Building2 className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                تفاصيل المعرض
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              الرجاء تعبئة جميع الحقول المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          اسم المعرض
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل اسم المعرض"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white text-right"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الإمارة
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white justify-end">
                              <SelectValue
                                placeholder="اختر الإمارة"
                                className="text-right "
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-right">
                            {EMIRATES.map((emirate) => (
                              <SelectItem
                                key={emirate}
                                value={emirate}
                                className="text-right justify-end"
                              >
                                {emirate}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/showrooms")}
                    className="px-6 py-3 rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "إنشاء المعرض"
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
