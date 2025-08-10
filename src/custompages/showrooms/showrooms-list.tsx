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
  Users,
  MapPin,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

type Showroom = {
  id: string;
  name: string;
  managers: string[];
  address: string;
  employeeCount: number;
  created_at: string;
};

export function ShowroomsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const res = await fetch("/api/showrooms", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load showrooms");
        }

        const json = await res.json();
        setShowrooms(json.showrooms || []);
      } catch (error) {
        console.error("Error fetching showrooms:", error);
      }
    };

    fetchShowrooms();
  }, []);

  const filteredShowrooms = showrooms.filter((showroom: Showroom) => {
    const managers = showroom.managers || [];
    return (
      showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      managers.some((manager: string) =>
        manager.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      showroom.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المعارض</h1>
          <p className="text-muted-foreground">إدارة جميع المعارض وتفاصيلها</p>
        </div>
        {user?.role === "owner" && (
          <Button asChild>
            <Link href="/dashboard/showrooms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة معرض
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع المعارض</CardTitle>
          <CardDescription>
            قائمة بجميع المعارض مع مدرائها وعدد الموظفين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المعارض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredShowrooms.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">لا توجد معارض</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "حاول تعديل مصطلحات البحث."
                  : "ابدأ بإضافة معرض جديد."}
              </p>
              {user?.role === "owner" && !searchTerm && (
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard/showrooms/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      إضافة معرض
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المعرض</TableHead>
                    <TableHead>المدراء</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>الموظفون</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShowrooms.map((showroom: Showroom) => {
                    const managers = showroom.managers || [];

                    return (
                      <TableRow key={showroom.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            {showroom.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {managers.length > 0 ? (
                              managers.map((manager: string, index: number) => (
                                <div key={index} className="flex items-center">
                                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{manager}</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  لا يوجد مدراء
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {showroom.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {showroom.employeeCount ?? 0} موظف
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(showroom.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/showrooms/${showroom.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
