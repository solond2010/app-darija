export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedMessage: string;
  conditionType: "lesson_completed" | "streak" | "xp" | "perfect_lesson" | "unit_completed";
  conditionValue: number | string;
}

export const achievementsData: Achievement[] = [
  {
    id: "first_lesson",
    title: "Primera lección",
    description: "Completa tu primera lección de Darija.",
    emoji: "🌱",
    unlockedMessage: "¡Has sembrado la primera semilla de tu aprendizaje! 🐱✨",
    conditionType: "lesson_completed",
    conditionValue: 1,
  },
  {
    id: "perfect_lesson",
    title: "Lección perfecta",
    description: "Completa una lección sin cometer ningún error.",
    emoji: "⭐",
    unlockedMessage: "¡Increíble! ¡Una lección impecable, Mashallah! 🤍",
    conditionType: "perfect_lesson",
    conditionValue: 1,
  },
  {
    id: "streak_7",
    title: "Racha de 7 días",
    description: "Mantén una racha de práctica de 7 días consecutivos.",
    emoji: "🔥",
    unlockedMessage: "¡Llevas una semana imparable, Sara! ¡Meshi está orgulloso! 🐱🔥",
    conditionType: "streak",
    conditionValue: 7,
  },
  {
    id: "xp_1000",
    title: "Súper Cerebro",
    description: "Consigue tus primeros 1000 puntos de XP.",
    emoji: "📚",
    unlockedMessage: "¡1000 XP acumulados! Tu vocabulario crece a pasos agigantados. 🧠🌟",
    conditionType: "xp",
    conditionValue: 1000,
  },
  {
    id: "unit_1_complete",
    title: "Iniciada en el Zoco",
    description: "Completa la Unidad 1 al completo.",
    emoji: "🏆",
    unlockedMessage: "¡Has terminado la Unidad 1! Ya puedes saludar y presentarte. 🎉",
    conditionType: "unit_completed",
    conditionValue: "unidad-1",
  },
  {
    id: "yemma_favorite",
    title: "La favorita de Yemma",
    description: "Completa la Unidad 4: La Familia.",
    emoji: "👩‍👧",
    unlockedMessage: "¡Familia completada! Tu suegra y cuñadas van a estar encantadas. 🤍👵",
    conditionType: "unit_completed",
    conditionValue: "unidad-4",
  },
  {
    id: "ama_de_casa",
    title: "Ama de casa marroquí",
    description: "Completa la Unidad 5: La Casa.",
    emoji: "🏠",
    unlockedMessage: "¡Ya conoces la casa! Dar, bab, kuzina... Estás en casa en Marruecos. 🏡✨",
    conditionType: "unit_completed",
    conditionValue: "unidad-5",
  },
  {
    id: "masterchef_marroqui",
    title: "Masterchef marroquí",
    description: "Completa la Unidad 6: Comida y Bebida.",
    emoji: "🍵",
    unlockedMessage: "¡Bnin! ¡Ya dominas el té y la comida! ¿Hacemos un cuscús? 😋",
    conditionType: "unit_completed",
    conditionValue: "unidad-6",
  },
  {
    id: "trabajadora_del_ano",
    title: "Trabajadora del año",
    description: "Completa la Unidad 7: Verbos del Día a Día.",
    emoji: "⚡",
    unlockedMessage: "¡Nakul, nshrab, nkhdem... los verbos son tuyos! Ahora hablas de verdad. 💪",
    conditionType: "unit_completed",
    conditionValue: "unidad-7",
  },
  {
    id: "estilista_del_zoco",
    title: "Estilista del Zoco",
    description: "Completa la Unidad 8: Colores y Ropa.",
    emoji: "👗",
    unlockedMessage: "¡Jilaba byad, sarwal k7al... Vistes con estilo marroquí! 🎨✨",
    conditionType: "unit_completed",
    conditionValue: "unidad-8",
  },
  {
    id: "calculadora_humana",
    title: "Calculadora humana",
    description: "Completa la Unidad 9: Los Números.",
    emoji: "🔢",
    unlockedMessage: "¡Wahd, jouj, tlata... Ya puedes regatear en el zoco! 💰🛒",
    conditionType: "unit_completed",
    conditionValue: "unidad-9",
  },
  {
    id: "guia_de_la_medina",
    title: "Guía de la Medina",
    description: "Completa la Unidad 10: La Ciudad.",
    emoji: "🕌",
    unlockedMessage: "¡So9, jama3, spetar... Ya te orientas sola por la medina! 🗺️🇲🇦",
    conditionType: "unit_completed",
    conditionValue: "unidad-10",
  },
  {
    id: "visionaria",
    title: "Visionaria del futuro",
    description: "Completa la Unidad 11: Hablar del Futuro.",
    emoji: "🚀",
    unlockedMessage: "¡Ghan nmshi, ghan nkhdem, ghan nkun Darija Boss! El futuro es tuyo. 🌟",
    conditionType: "unit_completed",
    conditionValue: "unidad-11",
  },
];
