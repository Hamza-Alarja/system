import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Users,
  DollarSign,
  Home,
  UserPlus,
  PlusCircle,
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
    name: "المعرض",
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
    icon: DollarSign,
    roles: ["owner", "accountant"],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const { user } = useAuthStore();

  if (
    !user ||
    !["owner", "accountant"].includes(user.role.trim().toLowerCase())
  ) {
    return null;
  }
  console.log("User role:", user.role);

  const filteredNavigation = navigation.filter(
    (item) =>
      user &&
      ["owner", "accountant"].includes(user.role) &&
      item.roles.includes(user.role)
  );

  return (
    <div className={cn("pb-12 w-64 bg-card border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
