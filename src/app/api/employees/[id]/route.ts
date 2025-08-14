import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  context: any // <-- استخدم any هنا أيضاً
) {
  const { id } = context.params;

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete employee" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Employee deleted" });
}