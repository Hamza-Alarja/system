"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  // أضف بيانات أخرى خاصة بالمستخدم إذا أردت
}

export default function MyDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // تأكد أن المستخدم مسجل دخول
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // أو أي صفحة تسجيل دخول لديك
      return;
    }

    async function fetchUserData() {
      try {
        // جلب بيانات المستخدم من API خاص أو من Supabase مباشرة
        const res = await fetch("/api/user-profile"); // أنشئ هذه الـ API لاحقًا
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        // هنا يمكنك التعامل مع الخطأ (مثلاً إعادة توجيه، رسالة خطأ..)
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [isAuthenticated, router]);

  if (loading) {
    return <div>جارٍ التحميل...</div>;
  }

  if (!profile) {
    return <div>لم يتم العثور على بيانات المستخدم</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">مرحباً، {profile.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>البريد الإلكتروني:</strong> {profile.email}
          </p>
          <p>
            <strong>الدور:</strong> {profile.role}
          </p>
          {/* أضف بيانات أخرى هنا حسب الحاجة */}
        </CardContent>
      </Card>

      {/* أضف مكونات أخرى خاصة بالمستخدم */}
    </div>
  );
}
