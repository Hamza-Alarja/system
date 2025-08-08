"use client";
import {
  useUser,
  createClientComponentClient,
} from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const user = useUser();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from("employees")
          .select(
            `
            name, 
            role, 
            salary,
            showroom:showrooms(name)
          `
          )
          .eq("user_id", user.id)
          .single();
        if (error) throw error;
        setEmployeeData(data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user]);

  if (loading) return <div>جارٍ التحميل...</div>;
  if (!user) return <div>يرجى تسجيل الدخول</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">مرحبا {employeeData?.name}</h1>
      <div className="space-y-2">
        <p>الوظيفة: {employeeData?.role}</p>
        <p>الراتب: {employeeData?.salary}</p>
        <p>المعرض: {employeeData?.showroom?.name}</p>
      </div>
    </div>
  );
}
