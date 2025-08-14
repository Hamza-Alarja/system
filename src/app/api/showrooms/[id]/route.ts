import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  _request: Request,
  context: any // أو context: { params: { id: string } }
) {
  const { id } = context.params;

  const { error } = await supabase
    .from("showrooms")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete showroom" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Showroom deleted" });
}

export async function PATCH(
  request: Request,
  context: any // أو context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await request.json();

  const { error } = await supabase
    .from("showrooms")
    .update(body)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update showroom" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Showroom updated" });
}