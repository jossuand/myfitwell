"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  useAuth();
  return (
    <header className="flex h-16 items-center justify-between bg-background px-6 border-0 ring-0 outline-none">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4" />
    </header>
  );
}
