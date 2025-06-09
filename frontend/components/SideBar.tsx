"use client";
import React, { useState } from "react";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { HiOutlineMenu } from "react-icons/hi"; // hamburger icon
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { GraduationCap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: "Add Student",
      icon: LuUserRoundPlus,
      href: "/dashboard/add-student",
    },
    {
      title: "Mark Attendance",
      icon: FaRegClock,
      href: "/dashboard/attendance",
    },
  ];

  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar on navigation (mobile)
  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Engineering Portal</span>
            <span className="text-xs text-slate-500">Student Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-2">
            Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 data-[active=true]:bg-primary/10 data-[active=true]:text-primary cursor-pointer"
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    onClick={() => handleNavClick(item.href)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
