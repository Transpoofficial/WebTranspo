'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabsComponent() {
  const pathname = usePathname();
  const activeTab = pathname.includes("private-trip") ? "private-trip" : "open-trip";

  return (
    <Tabs value={activeTab} className="w-full mb-6">
      <TabsList className="w-full h-full">
        <TabsTrigger asChild value="open-trip" className="text-lg font-semibold">
          <Link href="/tour-package/open-trip">OPEN TRIP</Link>
        </TabsTrigger>
        <TabsTrigger asChild value="private-trip" className="text-lg font-semibold">
          <Link href="/tour-package/private-trip">PRIVATE TRIP</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
