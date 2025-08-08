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
  DollarSign,
} from "lucide-react";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";

type Employee = {
  id: string;
  user_id: string;
  name: string;
  salary: number;
  role: string;
  showroomName?: string;
  created_at: string;
};

export function EmployeesListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { showrooms } = useAppStore();
  const { user, permissions } = useAuthStore();

  const canManageEmployees =
    user?.role === "owner" || permissions?.canManageEmployees;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("فشل في جلب الموظفين");
        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmployees();
  }, []);
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name &&
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShowroomName = (id?: string) => {
    const showroom = showrooms.find((s) => s.id === id);
    return showroom?.name || "معرض غير معروف";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الموظفون</h1>
          <p className="text-muted-foreground">إدارة جميع الموظفين في معارضك</p>
        </div>
        {canManageEmployees && (
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة موظف
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الموظفين</CardTitle>
          <CardDescription>
            قائمة بجميع الموظفين مع تعييناتهم في المعارض ومعلومات الرواتب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن الموظفين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">لا يوجد موظفون</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "حاول تعديل مصطلحات البحث."
                  : "ابدأ بإضافة موظف جديد."}
              </p>
              {canManageEmployees && !searchTerm && (
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard/employees/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      إضافة موظف
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الموظف</TableHead>
                    <TableHead>اسم المعرض</TableHead>
                    <TableHead>الراتب</TableHead>
                    <TableHead>صفة الموظف</TableHead>
                    <TableHead>تاريخ الانضمام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          {employee.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          {employee.showroomName || "معرض غير معروف"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                          {employee.salary.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{employee.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.createdAt
                          ? new Date(employee.createdAt).toLocaleDateString(
                              "en"
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
