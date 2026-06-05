export interface MeshiMessage {
  text: string;
  emoji: string;
}

export const meshiMessages = {
  greetings: [
    { text: "¡Marhaba Sara! ¿Lista para aprender un poco de Darija? 🐱", emoji: "😺" },
    { text: "¡Yallah Sara, vamos a por ello! 💪", emoji: "😸" },
    { text: "¡Hola Sara! Te eché de menos... ¿Practicamos? 💕", emoji: "😻" },
    { text: "¡Qué alegría verte, 7bibti! Vamos a sorprender a la familia. ✨", emoji: "😺" },
  ],
  // Short nudges shown when moving on to the NEXT exercise within a lesson.
  // (Do NOT use "greetings" here — those are welcome-back messages and make no
  // sense mid-lesson.)
  nextExercise: [
    { text: "¡A por la siguiente, Sara! 🐱", emoji: "😺" },
    { text: "¡Vamos con la próxima! 💪", emoji: "😸" },
    { text: "¡Sigue así, lo estás haciendo genial! ✨", emoji: "😻" },
    { text: "¡Siguiente palabra, yallah! 🚀", emoji: "😺" },
    { text: "¡Concentración, 7bibti! Vamos. 💛", emoji: "😸" },
  ],
  correct: [
    { text: "¡Bravo Sara! ¡Mashallah! 🐱✨", emoji: "🎉" },
    { text: "¡Así se hace, 7bibti! 💕", emoji: "😻" },
    { text: "¡Tu familia va a flipar! 🎉", emoji: "😸" },
    { text: "¡Espectacular, Sara! ¡Vas volando! 🚀", emoji: "😺" },
    { text: "¡Correcto! ¡Qué buena pronunciación! 🌟", emoji: "😻" },
    { text: "¡Eso es! ¡Lo tienes dominado! 👍", emoji: "😸" },
  ],
  incorrect: [
    { text: "¡Casi casi! Prueba otra vez 🐱", emoji: "🤔" },
    { text: "No pasa nada Sara, así se aprende 💪", emoji: "😸" },
    { text: "¡Mmmm no era esa! ¿Lo intentamos de nuevo? 🤔", emoji: "🤔" },
    { text: "¡Ay, casi! Respira y concéntrate, 7bibti. 💛", emoji: "😿" },
    { text: "¡Meshi sabe que puedes hacerlo! ¡Dale otra oportunidad! 💪", emoji: "😺" },
  ],
  streak: [
    { text: "¡Sara, llevas {n} días seguidos! ¡Eres increíble! 🔥🐱", emoji: "🎉" },
    { text: "¡Cuidado con romper la racha de {n} días! Meshi se pondrá triste... 😿", emoji: "🤔" },
    { text: "¡{n} días brillando! La constancia es la clave. ✨", emoji: "😻" },
  ],
  lowLives: [
    { text: "¡Cuidado, Sara! Solo te queda una vida. ¡Hagamos repaso si lo necesitas! 😿", emoji: "😿" },
    { text: "¡Uf, tensión! ¡Tú puedes, piensa despacio! 🤔", emoji: "🤔" },
  ],
  outOfLives: [
    { text: "¡Oh no, te has quedado sin vidas! 😴 Meshi te sugiere repasar vocabulario para recuperar fuerzas.", emoji: "😴" },
  ],
  perfectLesson: [
    { text: "¡WOOOOW! ¡Una lección impecable, Sara! ¡Te mereces un té con menta! 🍵✨", emoji: "🌟" },
    { text: "¡Sin fallos! ¡Eres oficialmente una Tetouaniya! 🏆😻", emoji: "🎉" },
  ],
  levelUp: [
    { text: "¡Felicidades Sara! Has subido al nivel {lvl}: \"{name}\" 🎉🐱", emoji: "🎉" },
  ],
};

export function getRandomMessage(category: keyof typeof meshiMessages, placeholderVal?: string | number): MeshiMessage {
  const list = meshiMessages[category];
  if (!Array.isArray(list)) return { text: "¡Sigue así, Sara!", emoji: "😺" };
  const randomIndex = Math.floor(Math.random() * list.length);
  const msg = list[randomIndex];

  if (placeholderVal !== undefined) {
    return {
      text: msg.text.replace("{n}", String(placeholderVal)).replace("{lvl}", String(placeholderVal)),
      emoji: msg.emoji,
    };
  }
  return msg;
}
