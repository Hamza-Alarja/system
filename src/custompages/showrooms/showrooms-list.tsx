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
import { PlusCircle, Search, Building2, MapPin, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

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
  const { user } = useAuthStore();

  useEffect(() => {
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

        const showroomsWithCount = (json.showrooms || []).map(
          (showroom: any) => {
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
          }
        );

        setShowrooms(showroomsWithCount);
      } catch (error) {
        console.error("Error fetching showrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowrooms();
  }, []);

  const filteredShowrooms = showrooms.filter((showroom: Showroom) => {
    return (
      showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showroom.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6" dir="rtl">
      {/* Header Section */}

      {/* Main Card */}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShowrooms.map((showroom) => (
                      <TableRow key={showroom.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex items-center">
                            <Building2 className="ml-2 h-4 w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm">
                              {showroom.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex items-center">
                            <MapPin className="ml-2 h-4 w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm">
                              {showroom.address}
                            </span>
                          </div>
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
