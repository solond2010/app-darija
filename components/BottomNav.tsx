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
            className="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all active:scale-90"
          >
            <motion.div
              animate={isActive ? { y: -2 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-2xl transition-colors duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose text-white glow-coral"
                  : "text-slate-400 hover:text-brand-coral"
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-[9px] font-title font-bold leading-none ${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};
export default BottomNav;
