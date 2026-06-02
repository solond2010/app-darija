"use client";

import React, { useState } from "react";
import { LogIn, UserPlus, LogOut, CloudCheck, Mail, Lock, ShieldCheck } from "lucide-react";
import { useAccount } from "../lib/useAccount";

export const AuthCard: React.FC = () => {
  const { user, isAdmin, loading, signIn, signUp, signOut } = useAccount();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-4 flex items-center justify-center h-20">
        <div className="w-6 h-6 border-3 border-brand-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="glass rounded-3xl p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-teal to-brand-majorelle glow-majorelle flex-shrink-0">
          <CloudCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-title text-brand-dark truncate">
            {user.email}
            {isAdmin && <span className="ml-1.5 text-[9px] align-middle bg-brand-majorelle/15 text-brand-majorelle px-1.5 py-0.5 rounded-full font-bold uppercase">admin</span>}
          </p>
          <p className="text-[11px] text-brand-teal font-semibold flex items-center gap-1 mt-0.5">
            <CloudCheck className="w-3 h-3" /> Progreso guardado en tu cuenta
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="btn-3d-gray py-2 px-3 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Salir
        </button>
      </div>
    );
  }

  const handle = async (mode: "in" | "up") => {
    setMsg(null);
    if (!email.trim() || password.length < 6) {
      setMsg({ type: "err", text: "Pon un email válido y una contraseña de 6+ caracteres." });
      return;
    }
    setBusy(true);
    try {
      const { error } = mode === "in"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
      if (error) {
        setMsg({ type: "err", text: error.message });
      } else if (mode === "up") {
        setMsg({ type: "ok", text: "¡Cuenta creada! Ya puedes entrar. (Si te pide confirmar el email, revisa tu correo.)" });
      }
    } catch (e) {
      setMsg({ type: "err", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-saffron to-brand-coral glow-coral">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <h5 className="text-sm font-bold font-title text-brand-dark">Tu cuenta</h5>
          <p className="text-[11px] text-slate-500 mt-0.5">Entra para guardar tu progreso para siempre</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border-2 border-brand-beige bg-white/70 px-3 py-2">
        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          autoComplete="email"
          className="flex-1 bg-transparent text-sm text-brand-dark placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2 rounded-xl border-2 border-brand-beige bg-white/70 px-3 py-2">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          className="flex-1 bg-transparent text-sm text-brand-dark placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handle("in")}
          disabled={busy}
          className="btn-3d-primary py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <LogIn className="w-4 h-4" /> Entrar
        </button>
        <button
          onClick={() => handle("up")}
          disabled={busy}
          className="btn-3d-secondary py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <UserPlus className="w-4 h-4" /> Crear cuenta
        </button>
      </div>

      {msg && (
        <p className={`text-[11px] font-semibold text-center ${msg.type === "ok" ? "text-brand-teal" : "text-rose-500"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
};
