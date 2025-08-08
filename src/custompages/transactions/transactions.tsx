"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Wallet,
  Banknote,
  HandCoins,
} from "lucide-react";
import { useAppStore } from "@/store/app";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

type TransactionType = "salary" | "sales" | "custody" | "expense" | "deduction";

export function TransactionsPage() {
  const fetchEmployees = useAppStore((state) => state.fetchEmployees);
  const fetchShowrooms = useAppStore((state) => state.fetchShowrooms);
  const fetchTransactions = useAppStore((state) => state.fetchTransactions);

  const employees = useAppStore((state) => state.employees);
  const showrooms = useAppStore((state) => state.showrooms);
  const transactions = useAppStore((state) => state.transactions);
  const setTransactions = useAppStore((state) => state.setTransactions);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchEmployees();
        await fetchShowrooms();

        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const transactionsData = await res.json();
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [fetchEmployees, fetchShowrooms, setTransactions]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | TransactionType>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("sales");

  const { filteredTransactions, totals } = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm) ||
        (t.employee_name &&
          t.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.showroom_name &&
          t.showroom_name.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });

    const income = transactions
      .filter((t) => ["sales", "custody"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => ["salary", "expense", "deduction"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      filteredTransactions: filtered,
      totals: {
        income,
        expenses,
        net: income - expenses,
      },
    };
  }, [transactions, searchTerm]);

  const getEmployeeName = (id?: string | number) =>
    employees.find((e) => String(e.id) === String(id))?.name || "—";

  const getShowroomName = (id?: string | number) =>
    showrooms.find((s) => String(s.id) === String(id))?.name || "—";

  const getTransactionConfig = (type: TransactionType) => {
    const config = {
      salary: {
        icon: <HandCoins className="h-4 w-4" />,
        variant: "secondary",
        text: "رواتب",
      },
      sales: {
        icon: <Banknote className="h-4 w-4" />,
        variant: "default",
        text: "مبيعات",
      },
      custody: {
        icon: <Wallet className="h-4 w-4" />,
        variant: "outline",
        text: "عهدة",
      },
      expense: {
        icon: <ArrowDown className="h-4 w-4" />,
        variant: "destructive",
        text: "مصروفات",
      },
      deduction: {
        icon: <ArrowDown className="h-4 w-4" />,
        variant: "destructive",
        text: "خصومات",
      },
    };
    return config[type] || config.sales;
  };

  const openDialog = (type: TransactionType) => {
    setTransactionType(type);
    setIsDialogOpen(true);
  };

  const quickActions = [
    {
      type: "custody",
      icon: <Wallet className="h-5 w-5" />,
      label: "إضافة عهدة",
    },
    {
      type: "salary",
      icon: <HandCoins className="h-5 w-5" />,
      label: "دفع راتب",
    },
    {
      type: "expense",
      icon: <ArrowDown className="h-5 w-5" />,
      label: "إضافة مصروف",
    },
  ];

  const renderTableContent = (transactionsToShow: typeof transactions) => {
    if (transactionsToShow.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">لا توجد معاملات</h3>
          <p className="text-sm text-muted-foreground max-w-[300px]">
            {searchTerm
              ? "لا توجد معاملات مطابقة للبحث"
              : "ابدأ بإضافة معاملة جديدة"}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] text-right">المبلغ</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">الموظف</TableHead>
              <TableHead className="text-right">المعرض</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsToShow.map((t) => {
              const isIncome = ["sales", "custody"].includes(t.type);
              return (
                <TableRow key={t.id} className="hover:bg-muted/50">
                  <TableCell
                    className={`font-medium text-right ${
                      isIncome ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {t.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.employee_name ||
                      getEmployeeName(t.employee_id || t.employeeId) ||
                      "لا يوجد"}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.showroom_name ||
                      getShowroomName(t.showroom_id || t.showroomId) ||
                      "لا يوجد"}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleDateString("en", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">المعاملات المالية</h1>
          <p className="text-sm text-muted-foreground">
            إدارة جميع السجلات المالية
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الرواتب</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.expenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              الأموال المسلمة
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.income.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <span
              className={`h-4 w-4 ${
                totals.net >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {totals.net >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totals.net >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(totals.net).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.type}
            variant="outline"
            onClick={() => openDialog(action.type as TransactionType)}
            className="gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>سجل المعاملات</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} معاملة موجودة
              </p>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المعاملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "all" | TransactionType)}
          >
            <TabsContent value="all">
              {renderTableContent(filteredTransactions)}
            </TabsContent>

            <TabsContent value="salary">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "salary")
              )}
            </TabsContent>

            <TabsContent value="custody">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "custody")
              )}
            </TabsContent>

            <TabsContent value="expense">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "expense")
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transactionType={transactionType}
        employees={employees}
        showrooms={showrooms}
      />
    </div>
  );
}
