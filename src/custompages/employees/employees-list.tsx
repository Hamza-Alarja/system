"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Users,
  Building2,
  Eye,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";
import { UaeDirhamIcon } from "../../custompages/UaeDirhamIcon";

type Employee = {
  id: string;
  user_id: string;
  name: string;
  salary: number;
  role: string;
  showroom_id?: string;
  createdAt: string;
};

export function EmployeesListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { showrooms } = useAppStore();
  const { user, permissions } = useAuthStore();

  const canManageEmployees =
    user?.role === "owner" || permissions?.canManageEmployees;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to load employees");
        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShowroomName = (id?: string) => {
    const showroom = showrooms.find((s) => s.id === id);
    return showroom?.name || "معرض غير معروف";
  };

  // Format numbers with English locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6" dir="rtl">
      {/* Main Card */}
      <Card className="border-0 rounded-lg sm:rounded-xl shadow-sm">
        <CardHeader className="p-3 sm:p-4 md:p-6 border-b">
          <div className="flex flex-col gap-3 sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold">
                جميع الموظفين
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                قائمة بجميع الموظفين مع تعييناتهم في المعارض ومعلومات الرواتب
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 pl-8 sm:pr-10 sm:pl-10 w-full text-xs sm:text-sm h-8 sm:h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8 sm:p-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-red-600" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center p-6 sm:p-12">
              <Users className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-3 text-sm sm:text-base md:text-lg font-medium text-gray-900">
                {searchTerm ? "لا توجد نتائج بحث" : "لا يوجد موظفون"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {searchTerm
                  ? "حاول تعديل مصطلحات البحث الخاصة بك"
                  : "ابدأ بإضافة موظف جديد"}
              </p>
              {canManageEmployees && !searchTerm && (
                <div className="mt-4">
                  <Button asChild size="sm">
                    <Link href="/dashboard/employees/new">
                      <PlusCircle className="ml-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">
                        إضافة موظف جديد
                      </span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="sm:hidden space-y-2 p-2">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {employee.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {employee.role}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span> {employee.showroomName || "معرض غير معروف"}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <UaeDirhamIcon className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">
                        {formatNumber(employee.salary)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        {employee.createdAt
                          ? new Date(employee.createdAt).toLocaleDateString(
                              "en"
                            )
                          : "—"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Tablet/Desktop View - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        اسم الموظف
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        الصفة
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        المعرض
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        الراتب
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        تاريخ الانضمام
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex items-center">
                            <Users className="ml-2 h-4 w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm">
                              {employee.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs"
                          >
                            {{
                              accountant: "محاسب",
                              employee: "موظف",
                            }[employee.role] || employee.role}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex items-center">
                            <Building2 className="ml-2 h-4 w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm">
                              {employee.showroomName || "معرض غير معروف"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex items-center gap-1">
                            <UaeDirhamIcon />
                            <span className="text-[10px] sm:text-xs">
                              {formatNumber(employee.salary)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4 py-2">
                          {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString(
                                "en"
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
