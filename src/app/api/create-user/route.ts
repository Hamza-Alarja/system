import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/serverAdminClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, showroomId, salary } = body;

    // إنشاء المستخدم في auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create auth user" }, { status: 400 });
    }

    const authUserId = authData.user.id;

    // إدراج في جدول users
    const { error: userError } = await supabaseAdmin.from("users").insert({
      auth_user_id: authUserId,
      email,
      name,
      role,
    });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
      
    }

    // إدراج في جدول employees
    const { error: empError } = await supabaseAdmin.from("employees").insert({
      user_id: authUserId,
      name,
      role,
      showroom_id: showroomId,
      salary: Math.round(Number(salary)),
    });

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Employee created successfully" });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
