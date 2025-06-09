import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";
import Header from "@/components/header";

const sidebarNavItems = [
  {
    title: "Profil",
    href: "/settings/profile",
  },
  {
    title: "Pesanan",
    href: "/settings/order",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <Header />

      <div className="container mx-auto pt-10 pb-16 px-4 md:px-10">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:min-w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="min-w-full w-full lg:min-w-4/5 lg:w-4/5">{children}</div>
        </div>
      </div>
    </>
  );
}
