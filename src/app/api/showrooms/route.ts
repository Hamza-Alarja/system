import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase =  createRouteHandlerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("showrooms")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ showrooms: data });
}
