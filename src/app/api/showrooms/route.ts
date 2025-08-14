import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createRouteHandlerClient();

  const {  
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // يمكنك هنا جلب الدور من جدول users إذا لم يكن موجوداً في user
  // if (!["owner", "accountant"].includes(user.role)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const { data, error } = await supabase
    .from("showrooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ showrooms: data });
}