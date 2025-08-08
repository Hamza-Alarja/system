import { NextResponse } from "next/server";
import { db } from "@/app/db/db";
import { employees, showrooms } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allEmployees = await db
      .select({
        id: employees.id,
        name: employees.name,
        role: employees.role,
        salary: employees.salary,
        createdAt: employees.createdAt,
        showroomId: employees.showroomId,
        showroomName: showrooms.name,   
      })
      .from(employees)
      .leftJoin(showrooms, eq(employees.showroomId, showrooms.id)); // 👈 نربط الجداول

    console.log("✅ Employees fetched:", allEmployees);

    return NextResponse.json({ employees: allEmployees });
  } catch (error: any) {
    console.error("🔥 Error fetching employees:", error);

    return NextResponse.json(
      {
        error: "فشل في جلب الموظفين",
        details: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
