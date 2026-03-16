"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewSwitcherProps {
  activeView: "list" | "tile";
}

export function ViewSwitcher({ activeView }: ViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={activeView === "list" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => setView("list")}
        aria-label="List view"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={activeView === "tile" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => setView("tile")}
        aria-label="Tile view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
