import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(_request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userError2 } = await supabase
      .from("users")
      .select("id, email, auth_user_id")
      .eq("email", user.email)
      .single();

    if (userError2 || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id, name, salary, role, showroom_id, created_at")
      .eq("user_id", userData.auth_user_id.trim());

    if (empError || !employees || employees.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = employees[0];

const { data: showrooms, error: showroomError } = await supabase
  .from("showrooms")
  .select("name")
  .eq("id", employee.showroom_id.toString().trim());

console.log("showrooms found:", showrooms);

if (showroomError || !showrooms || showrooms.length === 0) {
  return NextResponse.json({ error: "Showroom not found" }, { status: 404 });
}

return NextResponse.json({
  id: userData.id,
  email: userData.email,
  employee: {
    ...employee,
    showroom_name: showrooms[0].name,
  },
});

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}