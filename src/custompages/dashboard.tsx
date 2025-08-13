"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Building2, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useAppStore } from "@/store/app";
import Link from "next/link";
import { UaeDirhamIcon } from "../custompages/UaeDirhamIcon";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { showrooms, employees, transactions } = useAppStore();

  // Format numbers with English locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const stats = [
    {
      title: "إجمالي المعارض",
      value: formatNumber(showrooms.length),
      icon: Building2,
      description: "معارض نشطة",
      color: "text-blue-600",
    },
    {
      title: "إجمالي الموظفين",
      value: formatNumber(employees.length),
      icon: Users,
      description: "موظفين نشطين",
      color: "text-green-600",
    },
    {
      title: "المصاريف الشهرية",
      value: `${formatNumber(
        transactions
          .filter((t) => t.type === "sales")
          .reduce((sum, t) => sum + t.amount, 0)
      )}`,
      icon: UaeDirhamIcon,
      description: "هذا الشهر",
      color: "text-purple-600",
    },
    {
      title: "معدل النمو",
      value: "+12.5%",
      icon: TrendingUp,
      description: "مقارنة بالشهر الماضي",
      color: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "إضافة معرض جديد",
      icon: Building2,
      href: "/dashboard/showrooms/new",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "إضافة موظف جديد",
      icon: Users,
      href: "/dashboard/employees/new",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "تسجيل معاملة مالية",
      icon: UaeDirhamIcon,
      href: "/dashboard/transactions",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 mt-1">
            مرحباً بعودتك،{" "}
            <span className="font-medium text-primary">{user?.name}</span>! هذه
            أحدث التطورات في معارضك.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 rounded-xl shadow-sm  ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg ${
                  stat.color.replace("text", "bg") + " bg-opacity-20"
                }`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Now takes full width */}
      <div className="grid gap-4">
        <Card className="border-0 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              إجراءات سريعة
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              الوصول السريع إلى المهام الأساسية
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`flex items-center p-4 rounded-lg transition-all  ${action.color.replace(
                  "text"
                )} border border-gray-100`}
              >
                <div
                  className={`p-2 rounded-lg ${action.color} bg-opacity-20 mr-3`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="font-medium">{action.title}</span>
                <Plus className="h-4 w-4 text-gray-400 mr-auto" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
