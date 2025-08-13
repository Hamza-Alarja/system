import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // التحقق من المستخدم
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // جلب employee_id من جدول employees
    const { data: empData, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (empError || !empData) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // جلب بيانات المبيعات الخاصة بالموظف
    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("amount, description, created_at")
      .eq("employee_id", empData.id) // فلترة حسب الموظف
      .order("created_at", { ascending: false });

    if (salesError) {
      return NextResponse.json({ error: "Error fetching sales" }, { status: 500 });
    }

    return NextResponse.json({ sales: sales || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}