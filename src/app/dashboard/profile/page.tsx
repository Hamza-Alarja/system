"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  employees: {
    id: string;
    name: string;
    salary: number;
    role: string;
    showroom_id: string;
    created_at: string;
  }[];
}

export default function MyDashboard() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchUserData() {
      try {
        const res = await fetch("/api/user-profile");
        if (!res.ok) {
          const errorData = await res.json();
          console.error("API fetch error:", errorData);
          setProfile(null);
          return;
        }
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Fetch user profile error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
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

  if (loading) return <div>جارٍ التحميل...</div>;

  if (!profile)
    return (
      <div>لم يتم العثور على بيانات المستخدم، يرجى تسجيل الدخول مرة أخرى.</div>
    );

  // افتراض أن هناك موظف واحد مرتبط بالمستخدم
  const employee = profile.employee;
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">
        مرحباً، {employee?.name || "المستخدم"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>البريد الإلكتروني:</strong> {profile.email}
          </p>
          <p>
            <strong>الراتب:</strong> {employee?.salary ?? "غير متوفر"}
          </p>
          <p>
            <strong>الدور:</strong> {employee?.role ?? "غير متوفر"}
          </p>
          <p>
            <strong>معرف المعرض:</strong>{" "}
            {employee?.showroom_name ?? "غير متوفر"}
          </p>
          <p>
            <strong>تاريخ الإنشاء:</strong>{" "}
            {employee?.created_at
              ? new Date(employee.created_at).toLocaleDateString("en-US")
              : "غير متوفر"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
