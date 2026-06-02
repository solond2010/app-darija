"use client";

import React, { useRef, useState } from "react";
import { Download, Upload, Copy, Check, CloudCheck, ShieldCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { flushNow } from "../lib/progressSync";

function encodeSnapshot(obj: unknown): string {
  // URL-safe base64 of the JSON, easy to copy/paste anywhere.
  const json = JSON.stringify(obj);
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(json)));
}

function decodeSnapshot(code: string): Record<string, unknown> | null {
  try {
    const json = decodeURIComponent(escape(window.atob(code.trim())));
    const obj = JSON.parse(json);
    return typeof obj === "object" && obj ? obj : null;
  } catch {
    try {
      // Maybe they pasted raw JSON instead of a code
      const obj = JSON.parse(code);
      return typeof obj === "object" && obj ? obj : null;
    } catch {
      return null;
    }
  }
}

export const ProgressBackup: React.FC = () => {
  const exportSnapshot = useStore((s) => s.exportSnapshot);
  const importSnapshot = useStore((s) => s.importSnapshot);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const snap = exportSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `meshi-progreso-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: "ok", msg: "Archivo de copia descargado 💾" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encodeSnapshot(exportSnapshot()));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback({ type: "err", msg: "No se pudo copiar al portapapeles" });
    }
  };

  const applyImport = (data: Record<string, unknown> | null) => {
    if (!data) {
      setFeedback({ type: "err", msg: "El código no es válido. Revísalo e inténtalo de nuevo." });
      return;
    }
    importSnapshot(data as never);
    flushNow();
    setFeedback({ type: "ok", msg: "¡Progreso restaurado correctamente! 🎉" });
    setImporting(false);
    setCode("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyImport(decodeSnapshot(String(reader.result)));
    reader.readAsText(file);
  };

  return (
    <div className="glass rounded-3xl p-4 flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-teal to-brand-majorelle glow-majorelle">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <h5 className="text-sm font-bold font-title text-brand-dark">Copia de seguridad</h5>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <CloudCheck className="w-3 h-3 text-brand-teal" /> Tu progreso se guarda solo en la nube
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          className="btn-3d-gray py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Descargar
        </button>
        <button
          onClick={handleCopy}
          className="btn-3d-gray py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-brand-teal" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "¡Copiado!" : "Copiar código"}
        </button>
      </div>

      {!importing ? (
        <button
          onClick={() => { setImporting(true); setFeedback(null); }}
          className="btn-3d-secondary py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" /> Restaurar progreso
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Pega aquí tu código de copia…"
            rows={3}
            className="w-full text-xs rounded-xl border-2 border-brand-beige bg-white/70 p-2.5 resize-none focus:outline-none focus:border-brand-coral text-brand-dark"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyImport(decodeSnapshot(code))}
              disabled={!code.trim()}
              className="btn-3d-mint py-2.5 px-3 text-xs font-bold disabled:opacity-50"
            >
              Restaurar código
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-3d-gray py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Desde archivo
            </button>
          </div>
          <button
            onClick={() => { setImporting(false); setCode(""); setFeedback(null); }}
            className="text-[11px] text-slate-400 font-semibold py-1"
          >
            Cancelar
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
        </div>
      )}

      {feedback && (
        <p className={`text-[11px] font-semibold text-center ${feedback.type === "ok" ? "text-brand-teal" : "text-rose-500"}`}>
          {feedback.msg}
        </p>
      )}
    </div>
  );
};
