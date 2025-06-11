"use client";

import * as React from "react";
import {
  Car,
  ChartColumn,
  ClipboardList,
  FileText,
  House,
  Newspaper,
  TreePalm,
  User,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const data = {
    user: {
      name: session?.user?.fullName ?? "Guest",
      email: session?.user?.email ?? "guest@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: House,
      },
      {
        title: "Analisis",
        url: "#",
        icon: ChartColumn,
        isActive: pathname.split("/")[2] === "analytics" ? true : false,
        items: [
          {
            title: "Pesanan",
            url: "/admin/analytics/order",
          },
          {
            title: "Pendapatan",
            url: "/admin/analytics/income",
          },
        ],
      },
      {
        title: "Kendaraan",
        url: "/admin/vehicle",
        icon: Car,
      },
      {
        title: "Paket wisata",
        url: "/admin/tour-package",
        icon: TreePalm,
      },
      {
        title: "Pengguna",
        url: "/admin/user",
        icon: User,
      },
      {
        title: "Pesanan",
        url: "/admin/order",
        icon: ClipboardList,
      },
      {
        title: "Artikel",
        url: "/admin/article",
        icon: Newspaper,
      },
      {
        title: "Laporan",
        url: "/admin/report",
        icon: FileText,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src={"/images/logo/logo_3.png"}
                    alt="logo_3.png"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Transpo</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
