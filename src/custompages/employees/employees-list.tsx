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
  Loader2,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UaeDirhamIcon } from "../../custompages/UaeDirhamIcon";
import { useAppStore } from "@/store/app";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Employee = {
  id: string;
  user_id: string;
  name: string;
  salary: number;
  role: string;
  showroom_id?: string;
  showroomName?: string;
  createdAt: string;
};

export function EmployeesListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { showrooms, fetchShowrooms } = useAppStore();
  const { toast } = useToast();
  useEffect(() => {
    if (!showrooms || showrooms.length === 0) {
      fetchShowrooms?.();
    }
  }, [showrooms, fetchShowrooms]);

  const getShowroomName = (id?: string) => {
    const showroom = showrooms.find((s) => s.id === id);
    return showroom?.name || "معرض غير معروف";
  };

  const canManageEmployees = user?.role === "owner";

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
        toast({
          title: "خطأ",
          description: "فشل في تحميل قائمة الموظفين",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const startEditing = (employee: Employee) => {
    setEditingId(employee.id);
    setEditData({
      name: employee.name,
      salary: employee.salary,
      role: employee.role,
      showroom_id: employee.showroom_id,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update employee: ${res.status} ${res.statusText}`
        );
      }

      setEmployees(
        employees.map((employee) =>
          employee.id === id ? { ...employee, ...editData } : employee
        )
      );
      setEditingId(null);
      setEditData({});
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الموظف بنجاح",
      });
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الموظف",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الموظف؟")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to delete employee: ${res.status} ${res.statusText}`
        );
      }

      setEmployees(employees.filter((employee) => employee.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف الموظف بنجاح",
      });
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الموظف",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    {editingId === employee.id ? (
                      <div className="space-y-3">
                        <Input
                          name="name"
                          value={editData.name || ""}
                          onChange={handleEditChange}
                          placeholder="اسم الموظف"
                          className="text-sm"
                        />
                        <Input
                          name="salary"
                          type="number"
                          value={editData.salary || ""}
                          onChange={handleEditChange}
                          placeholder="الراتب"
                          className="text-sm"
                        />
                        <Select
                          value={editData.role || ""}
                          onValueChange={(value) =>
                            handleSelectChange("role", value)
                          }
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="اختر الصفة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">موظف</SelectItem>
                            <SelectItem value="accountant">محاسب</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={editData.showroom_id || ""}
                          onValueChange={(value) =>
                            handleSelectChange("showroom_id", value)
                          }
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="اختر المعرض" />
                          </SelectTrigger>
                          <SelectContent>
                            {showrooms.map((showroom) => (
                              <SelectItem key={showroom.id} value={showroom.id}>
                                {showroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 ml-1" />
                            إلغاء
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveEdit(employee.id)}
                          >
                            <Save className="h-4 w-4 ml-1" />
                            حفظ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-sm">
                              {employee.name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs"
                          >
                            {{
                              accountant: "محاسب",
                              employee: "موظف",
                            }[employee.role] || employee.role}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span>
                            {employee.showroomName ||
                              getShowroomName(employee.showroom_id)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <UaeDirhamIcon />
                          <span className="font-medium">
                            {formatNumber(employee.salary)}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {employee.createdAt
                              ? new Date(employee.createdAt).toLocaleDateString(
                                  "en"
                                )
                              : "—"}
                          </span>
                          {canManageEmployees && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => startEditing(employee)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(employee.id)}
                                disabled={deletingId === employee.id}
                              >
                                {deletingId === employee.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
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
                      {canManageEmployees && (
                        <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                          إجراءات
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === employee.id ? (
                            <Input
                              name="name"
                              value={editData.name || ""}
                              onChange={handleEditChange}
                              className="text-xs sm:text-sm h-8"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Users className="ml-2 h-4 w-4 text-gray-400" />
                              <span className="text-xs sm:text-sm">
                                {employee.name}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === employee.id ? (
                            <Select
                              value={editData.role || ""}
                              onValueChange={(value) =>
                                handleSelectChange("role", value)
                              }
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue placeholder="اختر الصفة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">موظف</SelectItem>
                                <SelectItem value="accountant">
                                  محاسب
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs"
                            >
                              {{
                                accountant: "محاسب",
                                employee: "موظف",
                              }[employee.role] || employee.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === employee.id ? (
                            <Select
                              value={editData.showroom_id || ""}
                              onValueChange={(value) =>
                                handleSelectChange("showroom_id", value)
                              }
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue placeholder="اختر المعرض" />
                              </SelectTrigger>
                              <SelectContent>
                                {showrooms.map((showroom) => (
                                  <SelectItem
                                    key={showroom.id}
                                    value={showroom.id}
                                  >
                                    {showroom.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center">
                              <Building2 className="ml-2 h-4 w-4 text-gray-400" />
                              <span className="text-xs sm:text-sm">
                                {employee.showroomName ||
                                  getShowroomName(employee.showroom_id)}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === employee.id ? (
                            <Input
                              name="salary"
                              type="number"
                              value={editData.salary || ""}
                              onChange={handleEditChange}
                              className="text-xs sm:text-sm h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <UaeDirhamIcon />
                              <span className="text-[10px] sm:text-xs">
                                {formatNumber(employee.salary)}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4 py-2">
                          {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString(
                                "en"
                              )
                            : "—"}
                        </TableCell>
                        {canManageEmployees && (
                          <TableCell className="px-2 sm:px-4 py-2">
                            {editingId === employee.id ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-8"
                                >
                                  <X className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(employee.id)}
                                  className="h-8"
                                >
                                  <Save className="h-4 w-4 ml-1" />
                                  حفظ
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => startEditing(employee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600"
                                  onClick={() => handleDelete(employee.id)}
                                  disabled={deletingId === employee.id}
                                >
                                  {deletingId === employee.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
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
