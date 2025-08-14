import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createRouteHandlerClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: employeesData, error: empError } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        role,
        salary,
        created_at,
        showroom_id
      `)
      .order("created_at", { ascending: false });

    if (empError) {
      console.error("Supabase employees error:", empError);
      return NextResponse.json(
        { error: "Failed to fetch employees", details: empError.message },
        { status: 500 }
      );
    }

    const { data: showroomsData, error: showError } = await supabase
      .from("showrooms")
      .select(`id, name`);

    if (showError) {
      console.error("Supabase showrooms error:", showError);
      return NextResponse.json(
        { error: "Failed to fetch showrooms", details: showError.message },
        { status: 500 }
      );
    }

  const employees = (employeesData || []).map(emp => ({
  ...emp,
  showroomId: emp.showroom_id,
  showroomName: showroomsData?.find(s => s.id === emp.showroom_id)?.name ?? null,
  createdAt: emp.created_at, 
}));

    return NextResponse.json({ employees });
  } catch (error: any) {
    console.error("🔥 Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error", details: error.message || error.toString() },
      { status: 500 }
    );
  }
}
