"use client";
import { useEffect, useState } from "react";
import supabaseAdmin from "@/lib/";

export default function AddUserPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user?.id;
      if (!user_id) return;
      console.log(session?.user?.id);

      const res = await fetch("/api/get-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      const data = await res.json();
      const role = data.role;

      if (role === "owner" || role === "accountant") {
        setAllowed(true);
      }

      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) return <p>جاري التحقق...</p>;
  if (!allowed) return <p>أنت غير مصرح لك بالدخول</p>;

  return <div>صفحة إضافة موظف هنا</div>;
}
