"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, RefreshCw, BookOpen, User } from "lucide-react";
import { haptics } from "../utils/haptics";

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
    <nav className="fixed bottom-3 left-3 right-3 h-[64px] flex items-center justify-around z-40 max-w-[22rem] mx-auto rounded-[1.6rem] px-1.5 bg-white/95 dark:bg-[#1A1B12]/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_34px_rgba(35,35,24,0.18)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => haptics.tap()}
            className="relative flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform"
          >
            {/* Shared sliding pill — animates smoothly between tabs via layoutId */}
            {isActive && (
              <motion.div
                layoutId="bottom-nav-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute w-[74%] h-[72%] rounded-2xl bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose glow-coral"
              />
            )}
            <div className="relative flex flex-col items-center gap-0.5 py-1.5">
              <Icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? "text-white stroke-[2.5]" : "text-slate-400 stroke-2"}`} />
              <span className={`text-[9px] font-title font-bold leading-none transition-colors duration-150 ${isActive ? "text-white opacity-100" : "text-slate-400 opacity-70"}`}>
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
