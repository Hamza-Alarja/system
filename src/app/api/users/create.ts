import { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { db } from "@/app/db/db";
import { employees } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password, name, role, showroom_id, creator_id } = req.body;

  if (!email || !password || !name || !role || !creator_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // التحقق من صلاحية المنشئ (creator_id)
    const creatorRes = await db
      .select()
      .from(employees)
      .where(eq(employees.user_id, creator_id));

    const creator = creatorRes[0];
    if (!creator) return res.status(403).json({ message: "Unauthorized" });

    // فقط المالك أو المحاسب بصلاحية يمكنه الإضافة
    if (creator.role === "employee") {
      return res.status(403).json({ message: "Employees cannot create users" });
    }

    // المحاسب لا يستطيع إضافة موظف بدون صلاحية
    if (creator.role === "accountant") {
      const perms = await db.query.permissions.findFirst({
        where: (p, { eq }) =>
          eq(p.user_id, creator_id) && eq(p.showroom_id, creator.showroom_id),
      });
      if (!perms?.can_add_employees) {
        return res.status(403).json({ message: "You are not allowed to add employees" });
      }
    }

    // إنشاء مستخدم Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    // إضافة سجل في employees
    await db.insert(employees).values({
      user_id: data.user.id,
      name,
      role,
      showroom_id,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}
