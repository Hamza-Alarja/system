import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, employeeId, showroomId } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: "النوع والمبلغ مطلوبان" }, { status: 400 });
    }

    const commonFields: any = {
      amount,
      description: description || null,
      employee_id: employeeId || null,
      showroom_id: showroomId || null,
      created_at: new Date().toISOString(),
    };

    let table = "";
    switch (type) {
      case "salary": table = "sales"; break;
      case "custody": table = "salary_records"; break;
    
      default:
        return NextResponse.json({ error: "نوع المعاملة غير مدعوم" }, { status: 400 });
    }

    const { data, error } = await supabase.from(table).insert([commonFields]).select().single();
    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "خطأ في إنشاء المعاملة", details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const showroomId = searchParams.get("showroomId");
    const employeeId = searchParams.get("employeeId");

    const buildFilters = () => {
      const filters: any = {};
      if (showroomId) filters.showroom_id = showroomId;
      if (employeeId) filters.employee_id = employeeId;
      return filters;
    };

    // جلب جميع الموظفين والمعارض
    const { data: employeesData } = await supabase.from("employees").select("id,user_id,name,showroom_id");
    const { data: showroomsData } = await supabase.from("showrooms").select("id,name");

    let allData: any[] = [];

    const tables: { key: string; typeName: string }[] = [
      { key: "salary_records", typeName: "salary" },
      { key: "sales", typeName: "sales" },
      { key: "advance_payments", typeName: "custody" },
      { key: "expenses", typeName: "expense" },
      { key: "deductions", typeName: "deduction" },
    ];

    for (const tableObj of tables) {
      if (!type || type === tableObj.typeName) {
        const { data, error } = await supabase
          .from(tableObj.key)
          .select("*")
          .match(buildFilters())
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((r: any) => {
          const employee = employeesData?.find(e => r.employee_id || e.user_id === r.employee_id);
          const employeeName = employee?.name ?? "—";

          const showroom = showroomsData?.find(
            s => s.id === (r.showroom_id || employee?.showroom_id)
          );
          const showroomName = showroom?.name ?? "—";

          return {
            ...r,
            employee_name: employeeName,
            showroom_name: showroomName,
            type: tableObj.typeName,
          };
        });

        allData = allData.concat(mapped);
        if (type === tableObj.typeName) return NextResponse.json(mapped);
      }
    }

    // ترتيب حسب التاريخ تنازلياً
    allData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json(allData);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "خطأ في جلب المعاملات", details: error.message },
      { status: 500 }
    );
  }
}