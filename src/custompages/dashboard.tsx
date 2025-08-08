"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, DollarSign, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useAppStore } from "@/store/app";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { showrooms, employees, transactions } = useAppStore();

  const stats = [
    {
      title: "إجمالي المعارض",
      value: showrooms.length,
      icon: Building2,
      description: "معارض نشطة",
    },
    {
      title: "إجمالي الموظفين",
      value: employees.length,
      icon: Users,
      description: "موظفين نشطين",
    },
    {
      title: "المصاريف الشهرية",
      value: `$${transactions
        .filter((t) => t.type === "sales")
        .reduce((sum, t) => sum + t.amount, 0)
        .toLocaleString()}`,
      icon: DollarSign,
      description: "هذا الشهر",
    },
    {
      title: "معدل النمو",
      value: "+12.5%",
      icon: TrendingUp,
      description: "مقارنة بالشهر الماضي",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            مرحباً بعودتك، {user?.name}! هذه أحدث التطورات في معارضك.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>النشاطات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    تمت إضافة موظف جديد لمعرض وسط المدينة
                  </p>
                  <p className="text-sm text-muted-foreground">منذ ساعتين</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    تم تحديث سجل المبيعات - $15,000
                  </p>
                  <p className="text-sm text-muted-foreground">منذ 4 ساعات</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-warning rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    تمت معالجة رواتب الشهر
                  </p>
                  <p className="text-sm text-muted-foreground">منذ يوم</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <button className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="text-sm">إضافة معرض جديد</span>
              </button>
              <button className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">إضافة موظف جديد</span>
              </button>
              <button className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm">تسجيل معاملة مالية</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
