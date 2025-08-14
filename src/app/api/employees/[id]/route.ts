import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import supabaseAdmin from "@/lib/supabaseAdmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: Request,
  context: any 
) {
  const { id } = context.params;
  const body = await request.json();

  const { error } = await supabase
    .from("employees")
    .update(body)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update employee" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Employee updated" });
}

export async function DELETE(
  _request: Request,
  context: any
) {
  const { id } = context.params;

  try {
    // جلب user_id من جدول employees
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { message: empError?.message || "الموظف غير موجود" },
        { status: 404 }
      );
    }

    const userId = employee.user_id;

    // حذف من جدول employees
    const { error: deleteEmpError } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (deleteEmpError) {
      throw new Error(deleteEmpError.message);
    }

    // حذف من جدول users
    if (userId) {
      const { error: deleteUserRowError } = await supabase
        .from("users")
        .delete()
        .eq("auth_user_id", userId); // غالباً العمود اسمه auth_user_id وليس id

      if (deleteUserRowError) {
        throw new Error(deleteUserRowError.message);
      }

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(authError.message);
      }
    }

    return NextResponse.json({ message: "تم حذف الموظف وجميع بياناته" });

  } catch (error: any) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { message: error.message || "حدث خطأ أثناء الحذف" },
      { status: 500 }
    );
  }
}