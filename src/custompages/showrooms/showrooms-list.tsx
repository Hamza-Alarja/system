"use client";

import { useEffect, useState } from "react";
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
  Building2,
  MapPin,
  Loader2,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

import { useToast } from "@/components/ui/use-toast";

type Showroom = {
  id: string;
  name: string;
  address: string;
  employeeCount: number;
  created_at: string;
};

export function ShowroomsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Showroom>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const fetchShowrooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/showrooms", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load showrooms");
      const json = await res.json();

      const employeesRes = await fetch("/api/employees");
      const employeesJson = await employeesRes.json();
      const allEmployees = employeesJson.employees || [];

      const showroomsWithCount = (json.showrooms || []).map((showroom: any) => {
        const count = allEmployees.filter(
          (emp: any) => emp.showroomId === showroom.id
        ).length;
        return {
          id: showroom.id,
          name: showroom.name,
          address: showroom.address,
          employeeCount: count,
          created_at: showroom.created_at,
        };
      });

      setShowrooms(showroomsWithCount);
    } catch (error) {
      console.error("Error fetching showrooms:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة المعارض",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const handleDelete = async (id: string) => {
    // إنشاء عنصر التأكيد
    const confirmDiv = document.createElement("div");
    confirmDiv.innerHTML = `
<div id="confirmOverlay" style="
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.25s ease;
">
  <div id="confirmBox" style="
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    max-width: 320px;
    text-align: center;
    box-shadow: 0 3px 15px rgba(0,0,0,0.12);
    transform: scale(0.95);
    transition: all 0.25s ease;
  ">
    <h3 style="margin-bottom: 10px; color: #333; font-size: 1rem;">تأكيد الحذف</h3>
    <p style="margin-bottom: 15px; color: #555; font-size: 0.85rem;">
      هل أنت متأكد أنك تريد حذف هذا المعرض؟
    </p>
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button id="confirmCancel" style="
        padding: 6px 14px;
        background: #f0f0f0;
        border: none;
        border-radius: 5px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f0f0f0'">
        إلغاء
      </button>
      <button id="confirmDelete" style="
        padding: 6px 14px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='#e53935'" onmouseout="this.style.background='#ff4444'">
        نعم، احذف
      </button>
    </div>
  </div>
</div>
  `;

    document.body.appendChild(confirmDiv);

    // إظهار مع تأثير حركي
    setTimeout(() => {
      const overlay = document.getElementById("confirmOverlay");
      const box = document.getElementById("confirmBox");
      if (overlay && box) {
        overlay.style.opacity = "1";
        box.style.transform = "scale(1)";
      }
    }, 10);

    // انتظار رد المستخدم
    const userConfirmed = await new Promise((resolve) => {
      document
        .getElementById("confirmDelete")
        ?.addEventListener("click", () => {
          // تأثير إغلاق عند الحذف
          const overlay = document.getElementById("confirmOverlay");
          const box = document.getElementById("confirmBox");
          if (overlay && box) {
            overlay.style.opacity = "0";
            box.style.transform = "scale(0.9)";
            setTimeout(() => {
              document.body.removeChild(confirmDiv);
              resolve(true);
            }, 300);
          }
        });

      document
        .getElementById("confirmCancel")
        ?.addEventListener("click", () => {
          // تأثير إغلاق عند الإلغاء
          const overlay = document.getElementById("confirmOverlay");
          const box = document.getElementById("confirmBox");
          if (overlay && box) {
            overlay.style.opacity = "0";
            box.style.transform = "scale(0.9)";
            setTimeout(() => {
              document.body.removeChild(confirmDiv);
              resolve(false);
            }, 300);
          }
        });
    });

    if (!userConfirmed) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/showrooms/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to delete showroom: ${res.status} ${res.statusText}`
        );
      }

      setShowrooms(showrooms.filter((showroom) => showroom.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف المعرض بنجاح",
      });
    } catch (error: any) {
      console.error("Error deleting showroom:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف المعرض",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (showroom: Showroom) => {
    setEditingId(showroom.id);
    setEditData({
      name: showroom.name,
      address: showroom.address,
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
      [name]: value,
    }));
  };

  const saveEdit = async (id: string) => {
    try {
      setSavingId(id); 
      const res = await fetch(`/api/showrooms/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update showroom: ${res.status} ${res.statusText}`
        );
      }

      setShowrooms(
        showrooms.map((showroom) =>
          showroom.id === id ? { ...showroom, ...editData } : showroom
        )
      );
      setEditingId(null);
      setEditData({});
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المعرض بنجاح",
      });
    } catch (error: any) {
      console.error("Error updating showroom:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث المعرض",
        variant: "destructive",
      });
    } finally {
      setSavingId(null); 
    }
  };

  const filteredShowrooms = showrooms.filter((showroom: Showroom) => {
    return (
      showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showroom.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6" dir="rtl">
      <Card className="border-0 rounded-lg sm:rounded-xl shadow-sm">
        <CardHeader className="p-3 sm:p-4 md:p-6 border-b">
          <div className="flex flex-col gap-3 sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold">
                قائمة المعارض في الإمارات
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                قائمة بجميع المعارض مع عدد الموظفين
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
          ) : filteredShowrooms.length === 0 ? (
            <div className="text-center p-6 sm:p-12">
              <Building2 className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-3 text-sm sm:text-base md:text-lg font-medium text-gray-900">
                {searchTerm ? "لا توجد نتائج بحث" : "لا توجد معارض مسجلة"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {searchTerm
                  ? "حاول تعديل مصطلحات البحث الخاصة بك"
                  : "ابدأ بإضافة معرض جديد"}
              </p>
              {user?.role === "owner" && !searchTerm && (
                <div className="mt-4">
                  <Button asChild size="sm">
                    <Link href="/dashboard/showrooms/new">
                      <PlusCircle className="ml-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">
                        إضافة معرض جديد
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
                {filteredShowrooms.map((showroom) => (
                  <Card key={showroom.id} className="p-3">
                    {editingId === showroom.id ? (
                      <div className="space-y-3">
                        <Input
                          name="name"
                          value={editData.name || ""}
                          onChange={handleEditChange}
                          className="text-sm"
                        />
                        <Input
                          name="address"
                          value={editData.address || ""}
                          onChange={handleEditChange}
                          className="text-sm"
                        />
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
                            onClick={() => saveEdit(showroom.id)}
                            className="h-8"
                            disabled={
                              editingId === showroom.id &&
                              savingId === showroom.id
                            } // نضيف state
                          >
                            {savingId === showroom.id ? (
                              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 ml-1" />
                            )}
                            {savingId === showroom.id ? "" : "حفظ"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-sm">
                              {showroom.name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              showroom.employeeCount > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50"
                            }`}
                          >
                            {showroom.employeeCount} موظف
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{showroom.address}</span>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {new Date(showroom.created_at).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => startEditing(showroom)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(showroom.id)}
                              disabled={deletingId === showroom.id}
                            >
                              {deletingId === showroom.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
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
                        اسم المعرض
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        الموقع
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        الموظفون
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        تاريخ الإنشاء
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4 py-2">
                        إجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShowrooms.map((showroom) => (
                      <TableRow key={showroom.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === showroom.id ? (
                            <Input
                              name="name"
                              value={editData.name || ""}
                              onChange={handleEditChange}
                              className="text-xs sm:text-sm h-8"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Building2 className="ml-2 h-4 w-4 text-gray-400" />
                              <span className="text-xs sm:text-sm">
                                {showroom.name}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === showroom.id ? (
                            <Input
                              name="address"
                              value={editData.address || ""}
                              onChange={handleEditChange}
                              className="text-xs sm:text-sm h-8"
                            />
                          ) : (
                            <div className="flex items-center">
                              <MapPin className="ml-2 h-4 w-4 text-gray-400" />
                              <span className="text-xs sm:text-sm">
                                {showroom.address}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-2 md:px-2 py-2">
                          <Badge
                            variant="outline"
                            className={`md:text-xs sm:text-xs ${
                              showroom.employeeCount > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50"
                            }`}
                          >
                            {showroom.employeeCount} موظف
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs sm:text-sm px-2 sm:px-4 py-2">
                          {new Date(showroom.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          {editingId === showroom.id ? (
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
                                onClick={() => saveEdit(showroom.id)}
                                className="h-8"
                                disabled={
                                  editingId === showroom.id &&
                                  savingId === showroom.id
                                } // نضيف state
                              >
                                {savingId === showroom.id ? (
                                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 ml-1" />
                                )}
                                {savingId === showroom.id ? "" : "حفظ"}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => startEditing(showroom)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(showroom.id)}
                                disabled={deletingId === showroom.id}
                              >
                                {deletingId === showroom.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
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
