// src/app/api/create-showroom/route.ts
import { NextRequest, NextResponse } from "next/server";
import { showroomSchema } from "@/lib/validations/showroom";
import { createRouteHandlerClient } from "@/lib/supabase/server"; 
import { supabaseAdmin } from "@/lib/supabase/serverAdminClient";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient(); 
  const body = await req.json();

  const validation = showroomSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "البيانات غير صالحة", issues: validation.error.format() },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, address, managers } = validation.data;

  const { error } = await supabaseAdmin.from("showrooms").insert({
    name,
    address,
    owner_id: user.id,
    manager_name: managers?.join(", ") || null,
  });

  if (error) {
    console.error("Database error:", error.message);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
