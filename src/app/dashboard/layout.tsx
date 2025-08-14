"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row-reverse min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4  flex-row-reverse min-h-screen ">
        {children}
      </main>
    </div>
  );
}
