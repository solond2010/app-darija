"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RefreshCw, BookOpen, User } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Inicio",      path: "/",            icon: Home },
    { label: "Repaso",      path: "/repaso",       icon: RefreshCw },
    { label: "Diccionario", path: "/diccionario",  icon: BookOpen },
    { label: "Perfil",      path: "/perfil",       icon: User },
  ];

  if (pathname.startsWith("/leccion/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[62px] bg-white/92 backdrop-blur-xl border-t-2 border-brand-beige flex items-center justify-around z-40 max-w-md mx-auto rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all"
          >
            <div
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-brand-coral text-white scale-105 shadow-[0_3px_10px_rgba(255,107,107,0.35)]"
                  : "text-slate-400"
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[9px] font-title font-bold leading-none ${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};
export default BottomNav;
