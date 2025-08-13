import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  uuid,
  pgEnum,
  varchar,
  serial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'accountant', 'manager']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('manager'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Showrooms table
export const showrooms = pgTable('showrooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  managerName: text('manager_name').notNull(),
  address: text('address').notNull(),
  employeeCount: integer('employee_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  role: text('role').notNull(),
  showroomId: uuid('showroom_id').notNull().references(() => showrooms.id, { onDelete: 'cascade' }),
  salary: decimal('salary', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const salary_records = pgTable("salary_records", {
  id: serial("id").primaryKey(),
  amount: integer("amount"),
  description: text("description"),
  employee_id: uuid("employee_id").references(() => employees.id),
  showroom_id: uuid("showroom_id").references(() => showrooms.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Advance Payments (Custody)
export const advance_payments = pgTable('advance_payments', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  description: text('description'),
  employee_id: uuid('employee_id').references(() => employees.id),
  showroom_id: uuid('showroom_id').references(() => showrooms.id),
  created_at: timestamp('created_at').defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  amount: integer("amount").notNull(),
  description: text("description"),
  employee_id: uuid("employee_id").references(() => employees.id),  // معرف الموظف
  showroom_id: uuid("showroom_id").references(() => showrooms.id), // لازم هذا الحقل موجود
  created_at: timestamp("created_at").defaultNow(),
});

// Deductions
export const deductions = pgTable('deductions', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  description: text('description'),
  employee_id: uuid('employee_id').references(() => employees.id),
  showroom_id: uuid('showroom_id').references(() => showrooms.id),
  created_at: timestamp('created_at').defaultNow(),
});

// Sales
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  description: text('description'),
  employee_id: uuid('employee_id').references(() => employees.id),
  showroom_id: uuid('showroom_id').references(() => showrooms.id),
  created_at: timestamp('created_at').defaultNow(),
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  grantedBy: uuid('granted_by').notNull().references(() => users.id),
  canManageEmployees: boolean('can_manage_employees').notNull().default(false),
  canViewFinancials: boolean('can_view_financials').notNull().default(false),
  canManageFinancials: boolean('can_manage_financials').notNull().default(false),
  canManageShowrooms: boolean('can_manage_showrooms').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  grantedPermissions: many(permissions, { relationName: 'grantedPermissions' }),
  receivedPermissions: many(permissions, { relationName: 'receivedPermissions' }),
}));

export const showroomsRelations = relations(showrooms, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  showroom: one(showrooms, {
    fields: [employees.showroomId],
    references: [showrooms.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
    relationName: 'receivedPermissions',
  }),
  grantedBy: one(users, {
    fields: [permissions.grantedBy],
    references: [users.id],
    relationName: 'grantedPermissions',
  }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Showroom = typeof showrooms.$inferSelect;
export type NewShowroom = typeof showrooms.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
