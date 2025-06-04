import React, { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Toaster position="bottom-right" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <main className="flex flex-1 flex-col p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default AdminLayout;
