// src/components/Sidebar.jsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, ShoppingBag, Utensils, Package, Users, X, CreditCard, Receipt } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Receipt, label: "Bills", href: "/admin/bills" },
  { icon: Utensils, label: "Menu", href: "/admin/menu" },
  { icon: Package, label: "Inventory", href: "/admin/inventory" },
  { icon: Users, label: "Employees", href: "/admin/employees" },
  { icon: BarChart3, label: "Analytics", href: "/admin" },
];

// ... imports
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { setOpen } = useSidebar();
  const { admin, logout } = useContext(AuthContext);

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "AD"; // Admin Default
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-orange-300">
              <AvatarFallback className="bg-orange-300 text-white font-semibold">
                M
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-lg">Momo Magic</span>
          </div>

          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="lg:hidden h-8 w-8"
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        h-12
                        px-4
                        rounded-lg
                        transition-colors
                        ${isActive
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Link
                        to={item.href}
                        className="flex items-center gap-3 w-full"
                        onClick={handleLinkClick}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-base font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 min-w-0"
            onClick={handleLinkClick}
          >
            <Avatar className="h-10 w-10 bg-orange-200 flex-shrink-0">
              <AvatarFallback className="bg-orange-200 text-orange-700 text-sm font-semibold">
                {getInitials(admin?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.position || "Staff"}
              </p>
            </div>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
