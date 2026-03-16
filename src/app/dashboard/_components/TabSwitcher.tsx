"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabSwitcherProps {
  activeTab: "date" | "type";
}

export function TabSwitcher({ activeTab }: TabSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="date">By Date</TabsTrigger>
        <TabsTrigger value="type">By Type</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
