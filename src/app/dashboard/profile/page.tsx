"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string;
  employee: {
    name: string;
    salary: number;
    role: string;
    showroom_name: string;
    created_at: string;
  };
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface Salary {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

interface PaidFund {
  id: string;
  amount: number;
  description: string;
  paid_at: string;
  created_at: string;
}

export default function MyDashboard() {
  const [today, setToday] = useState("");

  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [paidFunds, setPaidFunds] = useState<PaidFund[]>([]);

  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setToday(`${yyyy}-${mm}-${dd}`);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تنسيق الأرقام بدون كسور عشرية
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate totals
  const totalPaidFunds = paidFunds.reduce((sum, fund) => sum + fund.amount, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const remainingBalance = totalPaidFunds - totalExpenses;
  const balancePercentage =
    totalPaidFunds > 0 ? (remainingBalance / totalPaidFunds) * 100 : 0;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [profileRes, expensesRes, salariesRes, paidFundsRes] =
          await Promise.all([
            fetch("/api/user-profile"),
            fetch("/api/expenses"),
            fetch("/api/salaries"),
            fetch("/api/paid-funds"),
          ]);

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        if (!expensesRes.ok) throw new Error("Failed to fetch expenses");
        if (!salariesRes.ok) throw new Error("Failed to fetch salaries");
        if (!paidFundsRes.ok) throw new Error("Failed to fetch paid funds");

        const [profileData, expensesData, salariesData, paidFundsData] =
          await Promise.all([
            profileRes.json(),
            expensesRes.json(),
            salariesRes.json(),
            paidFundsRes.json(),
          ]);

        setProfile(profileData);
        setExpenses(expensesData);
        setSalaries(salariesData.sales || []);
        setPaidFunds(paidFundsData || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          date: new Date(newExpense.date).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const addedExpense = await res.json();
      setExpenses((prev) => [addedExpense, ...prev]);

      setNewExpense({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        dir="rtl"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        dir="rtl"
      >
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-red-600 mb-2">
            خطأ في تحميل البيانات
          </h3>
          <p className="text-gray-600 mb-4">
            لم يتم العثور على بيانات المستخدم
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            العودة إلى صفحة تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const { employee } = profile;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              مرحباً، <span className="">{employee?.name || "المستخدم"}</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-red-200  text-xs px-2 py-1 rounded-full">
                {{
                  accountant: "محاسب",
                  employee: "موظف",
                }[employee?.role] || "غير محدد"}
              </span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                {employee?.showroom_name || "غير محدد"}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 px-6 py-2 rounded-lg transition-colors"
          >
            {isLoggingOut ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                جاري تسجيل الخروج...
              </span>
            ) : (
              "تسجيل الخروج"
            )}
          </Button>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 rounded-xl  transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500">
                الأموال المسلمة
              </CardDescription>
              <CardTitle className="text-2xl font-bold ">
                {formatNumber(totalPaidFunds)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-0 rounded-xl   transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500">
                المصاريف
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-red-600">
                {formatNumber(totalExpenses)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-0 rounded-xl  transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500">
                الرصيد المتبقي
              </CardDescription>
              <CardTitle
                className={`text-2xl font-bold ${
                  remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatNumber(remainingBalance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="expenses" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1 h-12">
            <TabsTrigger
              value="expenses"
              className="py-2 rounded-md text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                المصاريف
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="salaries"
              className="py-2 rounded-md text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                الرواتب
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="paidFunds"
              className="py-2 rounded-md text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                الأموال المسلمة
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="mt-6">
            <Card className="border-0 rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className=" text-xl font-semibold">
                      إضافة مصروف جديد
                    </CardTitle>
                    <CardDescription className=" mt-1">
                      الرصيد المتاح: {formatNumber(remainingBalance)}
                    </CardDescription>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5
               bg-red-50 text-red-700 border border-red-100 
               hover:bg-red-100 transition-colors duration-200
               dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/50 dark:hover:bg-red-900/40"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    {expenses.length} مصاريف
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="amount"
                        className="block mb-2 text-gray-600 font-medium "
                      >
                        المبلغ
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            amount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        required
                        className="text-right text-lg font-medium h-12 no-spinner"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="description"
                        className="block mb-2 text-gray-600 font-medium"
                      >
                        الوصف
                      </Label>
                      <Input
                        id="description"
                        value={newExpense.description}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            description: e.target.value,
                          })
                        }
                        placeholder="وصف المصروف"
                        required
                        className="text-right h-12"
                      />
                    </div>
                    <div className="hidden">
                      <Label
                        htmlFor="date"
                        className="block mb-2 text-gray-600 font-medium"
                      >
                        التاريخ
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={today}
                        readOnly
                        className="text-right h-12 cursor-not-allowed bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        remainingBalance < parseFloat(newExpense.amount || "0")
                      }
                      className=" text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          جاري الإضافة...
                        </span>
                      ) : (
                        "إضافة المصروف"
                      )}
                    </Button>
                  </div>
                  {remainingBalance < parseFloat(newExpense.amount || "0") && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
                      <p className="text-sm font-medium">
                        الرصيد غير كافي لإضافة هذا المصروف
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-xl overflow-hidden shadow-sm mt-6">
              <CardHeader className="bg-gray-50 p-6 border-b">
                <CardTitle className="text-gray-800 text-xl font-semibold">
                  سجل المصاريف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المبلغ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الوصف
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التاريخ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-red-600 font-medium">
                                {formatNumber(expense.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                              {expense.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {new Date(expense.date).toLocaleDateString(
                                "en-US"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      لا توجد مصاريف مسجلة
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ابدأ بإضافة مصروف جديد باستخدام النموذج أعلاه
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="mt-6">
            <Card className="border-0 rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-green-800 text-xl font-semibold">
                      كشوف الرواتب
                    </CardTitle>
                    <CardDescription className="text-green-600 mt-1">
                      إجمالي الرواتب:{" "}
                      {formatNumber(
                        salaries.reduce((sum, salary) => sum + salary.amount, 0)
                      )}{" "}
                    </CardDescription>
                  </div>
                  <div
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
               bg-green-100 text-green-800 border border-green-200
               hover:bg-green-200 transition-colors duration-200
               dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/30"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse mx-1"></span>
                    {salaries.length} كشف راتب
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {salaries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المبلغ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الوصف
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ الإضافة
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salaries.map((salary) => (
                          <tr
                            key={salary.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-green-600 font-medium">
                                {formatNumber(salary.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                              {salary.description || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {new Date(salary.created_at).toLocaleDateString(
                                "en-US"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      لا توجد كشوف رواتب مسجلة
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      سيظهر هنا كشوف الرواتب عند توفرها
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paid Funds Tab */}
          <TabsContent value="paidFunds" className="mt-6">
            <Card className="border-0 rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-indigo-800 text-xl font-semibold">
                      الأموال المسلمة
                    </CardTitle>
                    <CardDescription className="text-indigo-600 mt-1">
                      إجمالي الأموال المسلمة: {formatNumber(totalPaidFunds)}
                    </CardDescription>
                  </div>
                  <div
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
               bg-indigo-100 text-indigo-800 border border-indigo-200
               hover:bg-indigo-200 transition-colors duration-200
               dark:bg-indigo-900/20 dark:text-indigo-200 dark:border-indigo-800/40"
                  >
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-1.5 animate-pulse dark:bg-indigo-500 mx-1"></span>
                    {paidFunds.length} سجل
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {paidFunds.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المبلغ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الوصف
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ الدفع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paidFunds.map((fund) => (
                          <tr
                            key={fund.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-indigo-600 font-medium">
                                {formatNumber(fund.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                              {fund.description || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {new Date(fund.paid_at).toLocaleDateString(
                                "en-US"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      لا توجد أموال مسلمة مسجلة
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      سيظهر هنا سجل الأموال المسلمة عند توفرها
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
