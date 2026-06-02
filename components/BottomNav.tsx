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
    <nav className="fixed bottom-3 left-3 right-3 h-[64px] glass-strong flex items-center justify-around z-40 max-w-[22rem] mx-auto rounded-[1.6rem] px-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all active:scale-90"
          >
            <div
              className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose text-white scale-105 glow-coral"
                  : "text-slate-400 hover:text-brand-coral"
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
