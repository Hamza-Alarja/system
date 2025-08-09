// src/app/api/get-role/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error: dbError } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();


  if (dbError || !data) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  return NextResponse.json({ role: data.role });
}
