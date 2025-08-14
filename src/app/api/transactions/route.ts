import { NextResponse } from "next/server";
import { db } from "@/app/db/db";
import {
  salary_records,
  sales,
  advance_payments,
  expenses,
  deductions,
  employees,
  showrooms,
} from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, employeeId, showroomId } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: "النوع والمبلغ مطلوبان" },
        { status: 400 }
      );
    }

    const employeeIdStr = typeof employeeId === "string" ? employeeId : null;
    const showroomIdStr = typeof showroomId === "string" ? showroomId : null;

    let newRecord;

    const commonFields = {
      amount,
      description: description || null,
      employee_id: employeeIdStr,
      showroom_id: showroomIdStr,
      created_at: new Date(),
    };

switch (type) {
  case "salary": // راتب
    newRecord = await db.insert(sales).values(commonFields).returning();
    break;
  case "custody": // عهدة
    newRecord = await db.insert(salary_records).values(commonFields).returning();
    break;
  default:
    return NextResponse.json(
      { error: "نوع المعاملة غير مدعوم" },
      { status: 400 }
    );
}

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "خطأ في إنشاء المعاملة" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const showroomId = searchParams.get("showroomId");
    const employeeId = searchParams.get("employeeId");

    const makeConditions = (table : any) => {
      const conditions = [];
      if (showroomId) conditions.push(eq(table.showroom_id, showroomId));
      if (employeeId) conditions.push(eq(table.employee_id, employeeId));
      return conditions;
    };

    let data: any[] = [];

    if (!type || type === "salary") {
      const salaries = await db
        .select({
          id: salary_records.id,
          amount: salary_records.amount,
          description: salary_records.description,
          employee_id: salary_records.employee_id,
          showroom_id: salary_records.showroom_id,
          created_at: salary_records.created_at,
          employee_name: employees.name,
          showroom_name: showrooms.name,
        })
        .from(salary_records)
        .leftJoin(employees, eq(salary_records.employee_id, employees.id))
        .leftJoin(showrooms, eq(salary_records.showroom_id, showrooms.id))
        .where(makeConditions(salary_records).length ? and(...makeConditions(salary_records)) : undefined)
        .orderBy(desc(salary_records.created_at));

      data = data.concat(salaries.map((r) => ({ ...r, type: "salary" })));
      if (type === "salary") return NextResponse.json(data);
    }

    if (!type || type === "sales") {
      const salesData = await db
        .select({
            id: sales.id,
                   amount: sales.amount,
                   description: sales.description,
                   employee_id: sales.employee_id,
                   showroom_id: sales.showroom_id,
                   created_at: sales.created_at,
          employee_name: employees.name,
          showroom_name: showrooms.name,
        })
        .from(sales)
        .leftJoin(employees, eq(sales.employee_id, employees.id))
        .leftJoin(showrooms, eq(sales.showroom_id, showrooms.id))
        .where(makeConditions(sales).length ? and(...makeConditions(sales)) : undefined)
        .orderBy(desc(sales.created_at));

      data = data.concat(salesData.map((r) => ({ ...r, type: "sales" })));
      if (type === "sales") return NextResponse.json(data);
    }

    if (!type || type === "custody") {
      const custodies = await db
        .select({
              id: advance_payments.id,
          amount: advance_payments.amount,
          description: advance_payments.description,
          employee_id: advance_payments.employee_id,
          showroom_id: advance_payments.showroom_id,
          created_at: advance_payments.created_at,
          employee_name: employees.name,
          showroom_name: showrooms.name,
        })
        .from(advance_payments)
        .leftJoin(employees, eq(advance_payments.employee_id, employees.id))
        .leftJoin(showrooms, eq(advance_payments.showroom_id, showrooms.id))
        .where(makeConditions(advance_payments).length ? and(...makeConditions(advance_payments)) : undefined)
        .orderBy(desc(advance_payments.created_at));

      data = data.concat(custodies.map((r) => ({ ...r, type: "custody" })));
      if (type === "custody") return NextResponse.json(data);
    }
  if (!type || type === "expense") {
  const expensesData = await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      created_at: expenses.created_at,
      employee_name: employees.name,
      showroom_name: showrooms.name,
    })
    .from(expenses)
    .leftJoin(employees, eq(expenses.employee_id, employees.user_id))
    .leftJoin(showrooms, eq(employees.showroomId, showrooms.id))
    .where(makeConditions(expenses).length ? and(...makeConditions(expenses)) : undefined)
    .orderBy(desc(expenses.created_at));

  console.log("Expenses data fetched:", expensesData);

  const resultWithDefaults = expensesData.map((r) => ({
    ...r,
    employee_name: r.employee_name || "—",
    showroom_name: r.showroom_name || "—",
    type: "expense",
  }));

  console.log("Expenses data after adding defaults:", resultWithDefaults);

  data = data.concat(resultWithDefaults);

  if (type === "expense") return NextResponse.json(resultWithDefaults);
}



    if (!type || type === "deduction") {
      const deductionsData = await db
        .select({
            id: deductions.id,
          amount: deductions.amount,
          description: deductions.description,
          employee_id: deductions.employee_id,
          showroom_id: deductions.showroom_id,
          created_at: deductions.created_at,
          employee_name: employees.name,
          showroom_name: showrooms.name,
        })
        .from(deductions)
        .leftJoin(employees, eq(deductions.employee_id, employees.id))
        .leftJoin(showrooms, eq(deductions.showroom_id, showrooms.id))
        .where(makeConditions(deductions).length ? and(...makeConditions(deductions)) : undefined)
        .orderBy(desc(deductions.created_at));
        
      data = data.concat(deductionsData.map((r) => ({
        ...r, type: "deduction"

      })));
      if (type === "deduction") return NextResponse.json(data);

    }

    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "خطأ في جلب المعاملات" },
      { status: 500 }
    );
  }
}