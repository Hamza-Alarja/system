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

    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id, name, salary, role, showroom_id, created_at")
      .eq("user_id", user.id);

    if (empError || !employees || employees.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = employees[0];

    let showroomName = null;
    if (employee.showroom_id) {
      const { data: showrooms, error: showroomError } = await supabase
        .from("showrooms")
        .select("name")
        .eq("id", employee.showroom_id.toString().trim());

      if (!showroomError && showrooms && showrooms.length > 0) {
        showroomName = showrooms[0].name;
      }
    }

    return NextResponse.json({
      id: employee.id,
      email: user.email,
      employee: {
        ...employee,
        showroom_name: showroomName,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}