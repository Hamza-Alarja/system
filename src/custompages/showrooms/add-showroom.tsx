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
import { Textarea } from "@/components/ui/textarea";
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
import { useAppStore } from "@/store/app";
import { ArrowLeft, Building2, Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddShowroomPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<string[]>([]);
  const [newManagerName, setNewManagerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addShowroom } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ShowroomFormData>({
    resolver: zodResolver(showroomSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const addManager = () => {
    const trimmedName = newManagerName.trim();
    if (trimmedName && !managers.includes(trimmedName)) {
      if (trimmedName.length < 2) {
        toast({
          title: "خطأ",
          description: "يجب أن يكون اسم المدير على الأقل حرفين",
          variant: "destructive",
        });
        return;
      }

      setManagers([...managers, trimmedName]);
      setNewManagerName("");
      setIsDialogOpen(false);
    }
  };

  const removeManager = (managerToRemove: string) => {
    setManagers(managers.filter((manager) => manager !== managerToRemove));
  };

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
          managers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Unknown error");
      }

      toast({
        title: "تم إنشاء المعرض",
        description: "تم إنشاء المعرض بنجاح.",
      });

      router.push("/dashboard/showrooms");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء المعرض. يرجى المحاولة مرة أخرى.",
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
          onClick={() => router.push("/dashboard/showrooms")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة معرض جديد</h1>
          <p className="text-muted-foreground">إنشاء موقع معرض جديد</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            تفاصيل المعرض
          </CardTitle>
          <CardDescription>أدخل تفاصيل المعرض الجديد</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المعرض</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المعرض" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>المدراء</FormLabel>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة مدير
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة مدير جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="أدخل اسم المدير"
                          value={newManagerName}
                          onChange={(e) => setNewManagerName(e.target.value)}
                          autoFocus
                        />
                        <Button
                          type="button"
                          onClick={addManager}
                          disabled={!newManagerName.trim()}
                          className="w-full"
                        >
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {managers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {managers.map((manager) => (
                      <Badge
                        key={manager}
                        variant="outline"
                        className="px-3 py-1 text-sm flex items-center gap-2"
                      >
                        {manager}
                        <button
                          type="button"
                          onClick={() => removeManager(manager)}
                          className="rounded-full hover:bg-accent p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    لم يتم إضافة أي مدراء بعد
                  </p>
                )}
              </FormItem>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل العنوان الكامل"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/showrooms")}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  إنشاء المعرض
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
