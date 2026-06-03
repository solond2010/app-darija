"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAccount, ADMIN_EMAIL } from "../../lib/useAccount";
import { AdminEditor } from "../../components/AdminEditor";

export default function AdminPage() {
  const { isAdmin, loading, user } = useAccount();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
          <Lock className="w-7 h-7 text-brand-coral" />
        </div>
        <h1 className="text-xl font-bold font-title text-brand-dark">Acceso restringido</h1>
        <p className="text-sm text-slate-500">
          {user
            ? `Esta zona es solo para la cuenta de administración (${ADMIN_EMAIL}). Has entrado como ${user.email}.`
            : `Inicia sesión con la cuenta de administración (${ADMIN_EMAIL}) para gestionar el contenido.`}
        </p>
        <Link href="/perfil" className="btn-3d-primary py-2.5 px-5 text-sm font-bold">
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  return <AdminEditor />;
}
