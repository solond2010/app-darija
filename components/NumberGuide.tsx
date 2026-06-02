"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";

interface NumberGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NumberGuide: React.FC<NumberGuideProps> = ({ isOpen, onClose }) => {
  const guides = [
    {
      number: "3",
      letter: "ع (Ayn)",
      pronunciation: "Un sonido profundo de la garganta, similar a un suspiro fuerte o un carraspeo suave en la 'a'.",
      example: "Salamu 3alaykum (Hola / La paz sea contigo)",
    },
    {
      number: "7",
      letter: "ح (Ha)",
      pronunciation: "Una 'h' muy aspirada y fuerte, como cuando empañas un cristal con el aliento.",
      example: "Sme7 li (Perdona) o L7amdulah (Gracias a Dios)",
    },
    {
      number: "9",
      letter: "ق (Qaf)",
      pronunciation: "Una 'k' pronunciada en la parte posterior de la garganta (úvula). A veces suena como un golpe seco.",
      example: "Fu9ash? (¿Cuándo?) o Sh7al hadshi? (¿Cuánto cuesta esto?)",
    },
    {
      number: "5",
      letter: "خ (Kha)",
      pronunciation: "Como la 'j' en español o la 'ch' en el alemán 'Bach'. Un sonido rascado.",
      example: "Sba7 l-5ir (Buenos días) o Ghedda (Mañana)",
    },
    {
      number: "8",
      letter: "غ (Ghayn)",
      pronunciation: "Como la 'r' francesa o el sonido de hacer gárgaras. Suave y gutural.",
      example: "8aba (Bosque) o Ba8i (Quiero - variante)",
    },
    {
      number: "2",
      letter: "ء (Hamza)",
      pronunciation: "Un corte seco en la respiración, como la pausa en medio de 'uh-oh'.",
      example: "L-3a2ila (La familia)",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end justify-center"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-cream border-t-4 border-brand-pink rounded-t-[2.5rem] shadow-2xl p-6 z-50 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-pink/30 mb-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-coral" />
                <h3 className="text-xl font-bold font-title text-brand-dark">
                  Guía de Números (Chat)
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-brand-pink text-slate-500 hover:text-brand-coral transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              En el chat marroquí se usan números para representar letras árabes que no existen en el alfabeto latino. ¡Aquí tienes la chuleta para Sara! 🐱
            </p>

            {/* Guide List */}
            <div className="flex flex-col gap-4">
              {guides.map((g) => (
                <div
                  key={g.number}
                  className="bg-white rounded-2xl p-4 border-2 border-[#FAF0DD] shadow-sm flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-pink/30 text-brand-coral font-bold text-2xl flex items-center justify-center font-title flex-shrink-0">
                    {g.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-brand-dark font-title">
                      {g.letter}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {g.pronunciation}
                    </p>
                    <div className="mt-2 text-[10px] bg-brand-cream/50 px-2 py-1 rounded-md text-brand-coral font-semibold inline-block">
                      Ej: <span className="font-mono">{g.example}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 btn-3d-primary text-center font-title"
            >
              ¡Entendido, Meshi! 👍
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
