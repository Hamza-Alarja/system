import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: empData, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (empError || !empData) {
      console.log("Employee data:", empData);

      console.error("Employee error:", empError);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { data: paidFunds, error: fundsError } = await supabase
      .from("salary_records")
      .select("id, amount, description, paid_at, created_at")
      .eq("employee_id", empData.id)
      .order("paid_at", { ascending: false });

      console.log("Employee id:", empData.id);
      console.log("Paid funds data:", paidFunds);  
      console.log("Paid funds error:", fundsError);
      
    if (fundsError) {
      console.error("Paid funds error:", fundsError);
      return NextResponse.json({ error: "Error fetching paid funds" }, { status: 500 });
    }

    return NextResponse.json(paidFunds || []);
  } catch (err: any) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
