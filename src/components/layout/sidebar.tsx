"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Users,
  Home,
  UserPlus,
  PlusCircle,
  WalletMinimal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const navigation = [
  {
    name: "لوحة التحكم",
    href: "/dashboard",
    icon: Home,
    roles: ["owner", "accountant", "manager"],
  },
  {
    name: "المعارض",
    href: "/dashboard/showrooms",
    icon: Building2,
    roles: ["owner", "accountant"],
  },
  {
    name: "إضافة معرض",
    href: "/dashboard/showrooms/new",
    icon: PlusCircle,
    roles: ["owner"],
  },
  {
    name: "الموظفون",
    href: "/dashboard/employees",
    icon: Users,
    roles: ["owner", "accountant"],
  },
  {
    name: "إضافة موظف",
    href: "/dashboard/employees/new",
    icon: UserPlus,
    roles: ["owner", "accountant"],
  },
  {
    name: "المعاملات ",
    href: "/dashboard/transactions",
    icon: WalletMinimal,
    roles: ["owner", "accountant"],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);

  if (
    !user ||
    !["owner", "accountant"].includes(user.role.trim().toLowerCase())
  ) {
    return null;
  }

  const filteredNavigation = navigation.filter(
    (item) =>
      user &&
      ["owner", "accountant"].includes(user.role) &&
      item.roles.includes(user.role)
  );

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="فتح القائمة"
          className="fixed top-3 left-3 z-50 md:hidden"
        >
          <div className="relative group">
            {/* Compact Red Hamburger Icon */}
            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-red-500/90 hover:bg-red-600 transition-all duration-200 shadow-md group-hover:shadow-lg">
              <span className="block w-5 h-0.5 bg-white mb-1.5 transition-all duration-200 transform group-hover:translate-y-1 group-hover:rotate-45 origin-center"></span>
              <span className="block w-5 h-0.5 bg-white mb-1.5 transition-all duration-100 opacity-100 group-hover:opacity-0"></span>
              <span className="block w-5 h-0.5 bg-white transition-all duration-200 transform group-hover:-translate-y-1 group-hover:-rotate-45 origin-center"></span>
            </div>

            {/* Subtle Red Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping opacity-0 group-hover:opacity-0 transition-opacity duration-700"></div>
          </div>
        </button>
      )}

      {/* السايدبار */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-card border-l border-gray-200 shadow-md transform transition-transform duration-300 ease-in-out z-40",
          className,
          isOpen ? "translate-x-0" : "translate-x-full",
          "md:relative md:translate-x-0 md:block"
        )}
      >
        {/* زر إغلاق القائمة - يظهر فقط على الشاشات الصغيرة لما السايدبار مفتوح */}
        {isOpen && (
          <div className="flex justify-end p-4 md:hidden">
            <button
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
              className="group relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300"
            >
              <div
                className="absolute inset-0 bg-red-500/10 dark:bg-red-900/40 rounded-md 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 group-active:scale-95 group-active:bg-red-500/20"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600 dark:text-red-400 
                 group-hover:text-red-700 dark:group-hover:text-red-300 
                 group-hover:scale-110 group-active:scale-95
                 transition-all duration-300 transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

              <span className="absolute inset-0 rounded-md overflow-hidden">
                <span className="absolute inset-0 bg-red-500 opacity-0 group-active:opacity-20 group-active:animate-ripple transition-all duration-700" />
              </span>
            </button>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex flex-row-reverse items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="ml-2 h-4 w-4" />
                    <span className="mr-2">{item.name}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
