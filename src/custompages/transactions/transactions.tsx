"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUp,
  ArrowDown,
  Wallet,
  Banknote,
  HandCoins,
  Filter,
} from "lucide-react";
import { useAppStore } from "@/store/app";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

type TransactionType = "salary" | "sales" | "custody" | "expense" | "deduction";

interface SortConfig {
  key: keyof any;
  direction: "ascending" | "descending";
}

export function TransactionsPage() {
  const fetchEmployees = useAppStore((state) => state.fetchEmployees);
  const fetchShowrooms = useAppStore((state) => state.fetchShowrooms);

  const employees = useAppStore((state) => state.employees);
  const showrooms = useAppStore((state) => state.showrooms);
  const transactions = useAppStore((state) => state.transactions);
  const setTransactions = useAppStore((state) => state.setTransactions);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | TransactionType>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("sales");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig] = useState<SortConfig | null>({
    key: "created_at",
    direction: "descending",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEmployees(), fetchShowrooms()]);

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

  const sortedTransactions = useMemo(() => {
    const sortableItems = [...transactions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const { filteredTransactions, totals } = useMemo(() => {
    const filtered = sortedTransactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm) ||
        (t.employee_name &&
          t.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.showroom_name &&
          t.showroom_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = activeTab === "all" || t.type === activeTab;

      const matchesDateRange =
        (!dateRange.start ||
          (t.created_at && new Date(t.created_at) >= dateRange.start)) &&
        (!dateRange.end ||
          (t.created_at && new Date(t.created_at) <= dateRange.end));

      return matchesSearch && matchesType && matchesDateRange;
    });

    const income = filtered
      .filter((t) => ["sales", "custody"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);
    const salariesPaid = filtered
      .filter((t) => t.type === "salary")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filtered
      .filter((t) => ["expense"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      filteredTransactions: filtered,
      totals: {
        salariesPaid,
        income,
        expenses,
        net: income - expenses - salariesPaid,
      },
    };
  }, [sortedTransactions, searchTerm, activeTab, dateRange]);

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
  ];

  const renderMobileTransactionCard = (t: any) => {
    const isIncome = ["sales", "custody"].includes(t.type);
    const config = getTransactionConfig(t.type);

    return (
      <Card key={`${t.type}-${t.id}`} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {config.icon}
                <h4 className="font-medium">{config.text}</h4>
              </div>
              <p className="text-sm mt-2">{t.description || "—"}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>
                  {t.employee_name ||
                    getEmployeeName(t.employee_id || t.employeeId) ||
                    "—"}
                </span>
                <span>•</span>
                <span>
                  {t.showroom_name ||
                    getShowroomName(t.showroom_id || t.showroomId) ||
                    "—"}
                </span>
              </div>
            </div>
            <div
              className={`font-medium ${
                isIncome ? "text-green-500" : "text-red-500"
              }`}
            >
              {isIncome ? "+" : "-"}
              {t.amount.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t.created_at
              ? new Date(t.created_at).toLocaleDateString("en", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTableContent = (transactionsToShow: typeof transactions) => {
    if (transactionsToShow.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">لا توجد معاملات</h3>
          <p className="text-sm text-muted-foreground max-w-[300px]">
            {searchTerm || dateRange.start || dateRange.end
              ? "لا توجد معاملات مطابقة للبحث أو الفلتر"
              : "ابدأ بإضافة معاملة جديدة"}
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-2 " dir="rtl">
          {transactionsToShow
            .filter((t) => !!t.id)
            .map((t, _idx) => renderMobileTransactionCard(t))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>{/* ...existing code... */}</TableHeader>
            <TableBody>
              {transactionsToShow
                .filter((t) => !!t.id)
                .map((t, idx) => {
                  const isIncome = ["sales", "custody"].includes(t.type);
                  return (
                    <TableRow
                      key={`${t.type}-${t.id ?? idx}`}
                      className="hover:bg-muted/50"
                    >
                      <TableCell
                        className={`font-medium text-right ${
                          isIncome ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {t.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.description || "—"}
                        </div>
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
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row justify-between gap-4"
        dir="rtl"
      >
        <div>
          <h1 className="text-2xl font-semibold">المعاملات المالية</h1>
          <p className="text-sm text-muted-foreground">
            إدارة جميع السجلات المالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 no-spinner"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  نوع المعاملة
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={activeTab}
                  onChange={(e) =>
                    setActiveTab(e.target.value as "all" | TransactionType)
                  }
                >
                  <option value="all">الكل</option>
                  <option value="expense">مصروفات</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  من تاريخ
                </label>
                <Input
                  type="date"
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      start: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  إلى تاريخ
                </label>
                <Input
                  type="date"
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      end: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الرواتب</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totals.income.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {
                filteredTransactions.filter((t) => ["sales"].includes(t.type))
                  .length
              }{" "}
              معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المصاريف</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totals.expenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {
                filteredTransactions.filter((t) => ["expense"].includes(t.type))
                  .length
              }{" "}
              معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">العهدة </CardTitle>
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
              {totals.salariesPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter((t) => t.type === "salary").length}{" "}
              معاملة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2" dir="rtl">
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
      <Card dir="rtl">
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
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="expense">مصروفات</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderTableContent(filteredTransactions)}
            </TabsContent>

            <TabsContent value="sales">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "sales")
              )}
            </TabsContent>

            <TabsContent value="custody">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "custody")
              )}
            </TabsContent>

            <TabsContent value="salary">
              {renderTableContent(
                filteredTransactions.filter((t) => t.type === "salary")
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
