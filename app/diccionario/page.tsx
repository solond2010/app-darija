"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Meshi } from "../../components/Suki";
import { useStore, LearnedWord } from "../../lib/store";
import { Search, Check, Info, BookOpen, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allVocabulary: (LearnedWord & { lessonId: string })[] = [
  // Lesson 1.1 Greetings
  { darija: "Salam / Salamu 3alaykum", spanish: "Hola / La paz sea contigo", category: "Saludos", example: "Salam, labas? (Hola, ¿qué tal?)", lessonId: "1.1" },
  { darija: "Labas?", spanish: "¿Estás bien? / ¿Qué tal?", category: "Saludos", example: "Labas, bikhir? (¿Qué tal, estás bien?)", lessonId: "1.1" },
  { darija: "Labas, l7amdulah", spanish: "Bien, gracias a Dios", category: "Saludos", example: "Respuesta al saludar: Labas, l7amdulah.", lessonId: "1.1" },
  { darija: "Sbah l-5ir", spanish: "Buenos días", category: "Saludos", lessonId: "1.1" },
  { darija: "Msa l-5ir", spanish: "Buenas tardes", category: "Saludos", lessonId: "1.1" },
  { darija: "Tsbah 3la 5ir", spanish: "Buenas noches (despedida)", category: "Saludos", lessonId: "1.1" },
  { darija: "Bslama", spanish: "Adiós", category: "Saludos", example: "Yallah bslama! (¡Venga, adiós!)", lessonId: "1.1" },
  { darija: "Shukran", spanish: "Gracias", category: "Saludos", example: "Shukran bzzaf (Muchas gracias)", lessonId: "1.1" },
  { darija: "La shukran 3la wajib", spanish: "De nada", category: "Saludos", lessonId: "1.1" },
  { darija: "3afak", spanish: "Por favor", category: "Saludos", example: "Atay 3afak (Té por favor)", lessonId: "1.1" },
  { darija: "Smeh li", spanish: "Perdona / Lo siento", category: "Saludos", lessonId: "1.1" },
  // Lesson 1.2 Pronouns
  { darija: "Ana", spanish: "Yo", category: "Pronombres", example: "Ana mn Sbanya (Yo soy de España)", lessonId: "1.2" },
  { darija: "Ntina", spanish: "Tú (norte)", category: "Pronombres", example: "Mnin ntina? (¿De dónde eres tú?)", lessonId: "1.2" },
  { darija: "Huwa", spanish: "Él", category: "Pronombres", lessonId: "1.2" },
  { darija: "Hiya", spanish: "Ella", category: "Pronombres", example: "Hiya mgasba (Ella está enfadada)", lessonId: "1.2" },
  { darija: "7naya", spanish: "Nosotros", category: "Pronombres", example: "7naya bikhir (Nosotros estamos bien)", lessonId: "1.2" },
  { darija: "Ntoma", spanish: "Vosotros", category: "Pronombres", lessonId: "1.2" },
  { darija: "Huma", spanish: "Ellos / Ellas", category: "Pronombres", lessonId: "1.2" },
  // Lesson 1.3 Introducing oneself
  { darija: "Smiti Sara", spanish: "Me llamo Sara", category: "Presentación", lessonId: "1.3" },
  { darija: "Shinu smitk?", spanish: "¿Cómo te llamas?", category: "Presentación", lessonId: "1.3" },
  { darija: "Ana mn Sbanya", spanish: "Soy de España", category: "Presentación", lessonId: "1.3" },
  { darija: "Mnin ntina?", spanish: "¿De dónde eres tú?", category: "Presentación", lessonId: "1.3" },
  { darija: "Mtsharfin", spanish: "Encantada / Encantado", category: "Presentación", example: "¡Mtsharfin, Sara! (¡Encantado, Sara!)", lessonId: "1.3" },
  { darija: "Ki dayr / dayra?", spanish: "¿Cómo estás? (masc/fem)", category: "Presentación", lessonId: "1.3" },
  { darija: "Ana bikhir", spanish: "Estoy bien", category: "Presentación", lessonId: "1.3" },
  // Lesson 2.1 States & Adjectives
  { darija: "3ayana / 3ayan", spanish: "Cansada / Cansado", category: "Sentimientos", example: "Ana 3ayana (Estoy cansada)", lessonId: "2.1" },
  { darija: "Fer7ana / Fer7an", spanish: "Contenta / Contento", category: "Sentimientos", lessonId: "2.1" },
  { darija: "Mgasba / Mgaseb", spanish: "Enfadada / Enfadado", category: "Sentimientos", lessonId: "2.1" },
  { darija: "Mesh3ola / Mesh3ol", spanish: "Ocupada / Ocupado", category: "Sentimientos", lessonId: "2.1" },
  { darija: "Mridha / Mridh", spanish: "Enferma / Enfermo", category: "Sentimientos", lessonId: "2.1" },
  { darija: "Zw3ana / Zw3an", spanish: "Hambrienta / Hambriento", category: "Sentimientos", lessonId: "2.1" },
  { darija: "3atshana / 3atshan", spanish: "Sedienta / Sediento", category: "Sentimientos", lessonId: "2.1" },
  { darija: "Nafsanya / Nafsani", spanish: "Triste (fem/masc)", category: "Sentimientos", lessonId: "2.1" },
  // Lesson 2.2 Expressing states
  { darija: "Ana 3ayana bzzaf", spanish: "Estoy muy cansada", category: "Sentimientos", lessonId: "2.2" },
  { darija: "Ntina fer7an?", spanish: "¿Estás contento?", category: "Sentimientos", lessonId: "2.2" },
  { darija: "Bzzaf", spanish: "Mucho / Muy", category: "Modificadores", example: "Zwina bzzaf (Muy bonita)", lessonId: "2.2" },
  { darija: "Shwiya", spanish: "Un poco", category: "Modificadores", example: "Mridha shwiya (Un poco enferma)", lessonId: "2.2" },
  { darija: "Mashi bzzaf", spanish: "No mucho", category: "Modificadores", lessonId: "2.2" },
  // Lesson 3.1 Interrogatives
  { darija: "Shinu?", spanish: "¿Qué?", category: "Preguntas", example: "Shinu had shi? (¿Qué es esto?)", lessonId: "3.1" },
  { darija: "Shkoun?", spanish: "¿Quién?", category: "Preguntas", example: "Shkoun f-dar? (¿Quién hay en casa?)", lessonId: "3.1" },
  { darija: "Fayen?", spanish: "¿Dónde?", category: "Preguntas", example: "Fayen ba? (¿Dónde está papá?)", lessonId: "3.1" },
  { darija: "Fu9ash?", spanish: "¿Cuándo?", category: "Preguntas", example: "Fu9ash ghan naklu? (¿Cuándo comeremos?)", lessonId: "3.1" },
  { darija: "3lash?", spanish: "¿Por qué?", category: "Preguntas", example: "3lash ma jitish? (¿Por qué no viniste?)", lessonId: "3.1" },
  { darija: "Kifash?", spanish: "¿Cómo?", category: "Preguntas", example: "Kifash dayer? (¿Cómo estás?)", lessonId: "3.1" },
  { darija: "Sh7al?", spanish: "¿Cuánto?", category: "Preguntas", example: "Sh7al hadshi? (¿Cuánto es esto?)", lessonId: "3.1" },
  { darija: "Wash?", spanish: "¿Acaso? (Partícula de sí/no)", category: "Preguntas", example: "Wash ntina bikhir? (¿Estás bien?)", lessonId: "3.1" },
  // Lesson 4.1 Family
  { darija: "L-3a2ila", spanish: "La familia", category: "Familia", lessonId: "4.1" },
  { darija: "Ba / Bba", spanish: "Papá", category: "Familia", lessonId: "4.1" },
  { darija: "Mma / Yemma", spanish: "Mamá", category: "Familia", example: "Had yemma (Esta es mi madre)", lessonId: "4.1" },
  { darija: "Khu", spanish: "Hermano", category: "Familia", example: "Khuya (Mi hermano)", lessonId: "4.1" },
  { darija: "Ukht", spanish: "Hermana", category: "Familia", example: "Khti (Mi hermana)", lessonId: "4.1" },
  { darija: "Jedd / Jedda", spanish: "Abuelo / Abuela", category: "Familia", lessonId: "4.1" },
  { darija: "3amm / 3amma", spanish: "Tío / Tía paternos", category: "Familia", lessonId: "4.1" },
  { darija: "Khal / Khala", spanish: "Tío / Tía maternos", category: "Familia", lessonId: "4.1" },
  { darija: "Weld / Bent", spanish: "Hijo / Hija (Chico/Chica)", category: "Familia", lessonId: "4.1" },
  { darija: "Rajl / Mra", spanish: "Marido / Esposa", category: "Familia", lessonId: "4.1" },
  // Lesson 4.2 Talk about Family
  { darija: "Had khuya", spanish: "Este es mi hermano", category: "Familia", lessonId: "4.2" },
  { darija: "3ndi jouj khutat", spanish: "Tengo dos hermanas", category: "Familia", lessonId: "4.2" },
  { darija: "Bba f-dar", spanish: "Papá está en casa", category: "Familia", lessonId: "4.2" },
  { darija: "Mma tayba l-makla", spanish: "Mamá está cocinando la comida", category: "Familia", lessonId: "4.2" },
  { darija: "L-3a2ila kbira", spanish: "La familia es grande", category: "Familia", lessonId: "4.2" },
  // Lesson 5.1 - La Casa
  { darija: "Dar", spanish: "Casa", category: "Casa", example: "Ana fi dar (Estoy en casa)", lessonId: "5.1" },
  { darija: "Bab", spanish: "Puerta", category: "Casa", lessonId: "5.1" },
  { darija: "Shrjm", spanish: "Ventana", category: "Casa", lessonId: "5.1" },
  { darija: "Bit", spanish: "Habitación", category: "Casa", lessonId: "5.1" },
  { darija: "Kuzina", spanish: "Cocina", category: "Casa", lessonId: "5.1" },
  { darija: "Bit l-ma", spanish: "Baño / Aseo", category: "Casa", lessonId: "5.1" },
  { darija: "Salon", spanish: "Salón", category: "Casa", lessonId: "5.1" },
  { darija: "Kursi", spanish: "Silla", category: "Casa", lessonId: "5.1" },
  { darija: "Tabla", spanish: "Mesa", category: "Casa", lessonId: "5.1" },
  { darija: "Ana fi dar", spanish: "Estoy en casa", category: "Frases", lessonId: "5.1" },
  // Lesson 5.2 - En Casa
  { darija: "Darna", spanish: "Nuestra casa", category: "Casa", lessonId: "5.2" },
  { darija: "Bba fi dar", spanish: "Papá está en casa", category: "Frases", lessonId: "5.2" },
  { darija: "Fi", spanish: "En / dentro de", category: "Preposiciones", lessonId: "5.2" },
  { darija: "L7it", spanish: "La pared", category: "Casa", lessonId: "5.2" },
  { darija: "Ardhiya", spanish: "El suelo", category: "Casa", lessonId: "5.2" },
  // Lesson 6.1 - Comida
  { darija: "L-makla", spanish: "La comida", category: "Comida", lessonId: "6.1" },
  { darija: "Lma", spanish: "Agua", category: "Comida", example: "3afak, 3tini shwiya d lma", lessonId: "6.1" },
  { darija: "Khobz", spanish: "Pan", category: "Comida", example: "Ana nakul khobz (Estoy comiendo pan)", lessonId: "6.1" },
  { darija: "Atay", spanish: "Té (a la menta)", category: "Comida", example: "Ana nshrab atay (Estoy tomando té)", lessonId: "6.1" },
  { darija: "Lham", spanish: "Carne", category: "Comida", lessonId: "6.1" },
  { darija: "Djdaj", spanish: "Pollo", category: "Comida", lessonId: "6.1" },
  { darija: "Hout", spanish: "Pescado", category: "Comida", lessonId: "6.1" },
  { darija: "Kefta", spanish: "Carne picada / albóndigas", category: "Comida", lessonId: "6.1" },
  { darija: "L7elwa", spanish: "Los dulces / postre", category: "Comida", lessonId: "6.1" },
  { darija: "Ldida", spanish: "Deliciosa / Rico", category: "Comida", lessonId: "6.1" },
  // Lesson 6.2 - Frases con comida
  { darija: "Had l-makla ldida bzzaf", spanish: "Esta comida está muy rica", category: "Frases", lessonId: "6.2" },
  { darija: "Tajin", spanish: "Tajín (guiso marroquí)", category: "Comida", lessonId: "6.2" },
  { darija: "Couscous", spanish: "Cuscús", category: "Comida", lessonId: "6.2" },
  { darija: "Harira", spanish: "Sopa Harira", category: "Comida", lessonId: "6.2" },
  // Lesson 7.1 - Verbos
  { darija: "Nakul", spanish: "Como / estoy comiendo", category: "Verbos", example: "Ana nakul khobz", lessonId: "7.1" },
  { darija: "Nshrab", spanish: "Bebo / estoy bebiendo", category: "Verbos", example: "Ana nshrab atay", lessonId: "7.1" },
  { darija: "N3as", spanish: "Duermo / estoy durmiendo", category: "Verbos", lessonId: "7.1" },
  { darija: "Nkhdem", spanish: "Trabajo / estoy trabajando", category: "Verbos", lessonId: "7.1" },
  { darija: "Nmshi", spanish: "Voy / estoy yendo", category: "Verbos", example: "Ana nmshi n-so9", lessonId: "7.1" },
  { darija: "Ana bghit nmshi", spanish: "Quiero ir", category: "Frases", lessonId: "7.1" },
  // Lesson 7.2 - Más verbos
  { darija: "Bghit", spanish: "Quiero / quería", category: "Verbos", example: "Bghit natay", lessonId: "7.2" },
  { darija: "Kanbghi", spanish: "Me gusta / amo", category: "Verbos", example: "Kanbghi l-makla lmaghribiya", lessonId: "7.2" },
  { darija: "Nqddar", spanish: "Puedo", category: "Verbos", lessonId: "7.2" },
  { darija: "N3raf", spanish: "Sé / conozco", category: "Verbos", lessonId: "7.2" },
  { darija: "Nkellm", spanish: "Hablo", category: "Verbos", lessonId: "7.2" },
  { darija: "Nfhem", spanish: "Entiendo", category: "Verbos", lessonId: "7.2" },
  // Lesson 8.1 - Colores
  { darija: "Byad", spanish: "Blanco", category: "Colores", lessonId: "8.1" },
  { darija: "K7al", spanish: "Negro", category: "Colores", lessonId: "8.1" },
  { darija: "7mar", spanish: "Rojo", category: "Colores", lessonId: "8.1" },
  { darija: "Khedar", spanish: "Verde", category: "Colores", lessonId: "8.1" },
  { darija: "Zra9", spanish: "Azul", category: "Colores", lessonId: "8.1" },
  { darija: "Sfar", spanish: "Amarillo", category: "Colores", lessonId: "8.1" },
  { darija: "Lgriz", spanish: "Gris", category: "Colores", lessonId: "8.1" },
  { darija: "Lbni", spanish: "Marrón", category: "Colores", lessonId: "8.1" },
  { darija: "Lwardiya", spanish: "Rosa", category: "Colores", lessonId: "8.1" },
  // Lesson 8.2 - Ropa
  { darija: "7wayej", spanish: "Ropa (en general)", category: "Ropa", lessonId: "8.2" },
  { darija: "Qamisa", spanish: "Camiseta / Camisa", category: "Ropa", lessonId: "8.2" },
  { darija: "Sarwal", spanish: "Pantalón", category: "Ropa", lessonId: "8.2" },
  { darija: "Jilaba", spanish: "Chilaba", category: "Ropa", lessonId: "8.2" },
  { darija: "Jaketa", spanish: "Chaqueta / Abrigo", category: "Ropa", lessonId: "8.2" },
  { darija: "Sbabet", spanish: "Zapatos", category: "Ropa", lessonId: "8.2" },
  { darija: "T9ashar", spanish: "Falda", category: "Ropa", lessonId: "8.2" },
  { darija: "Balgha", spanish: "Babuchas", category: "Ropa", lessonId: "8.2" },
  // Lesson 9.1 - Números 1-10
  { darija: "Wahd", spanish: "Uno (1)", category: "Números", lessonId: "9.1" },
  { darija: "Jouj", spanish: "Dos (2)", category: "Números", lessonId: "9.1" },
  { darija: "Tlata", spanish: "Tres (3)", category: "Números", lessonId: "9.1" },
  { darija: "Rb3a", spanish: "Cuatro (4)", category: "Números", lessonId: "9.1" },
  { darija: "Khamsa", spanish: "Cinco (5)", category: "Números", lessonId: "9.1" },
  { darija: "Stta", spanish: "Seis (6)", category: "Números", lessonId: "9.1" },
  { darija: "Sb3a", spanish: "Siete (7)", category: "Números", lessonId: "9.1" },
  { darija: "Tmnya", spanish: "Ocho (8)", category: "Números", lessonId: "9.1" },
  { darija: "Ts3ud", spanish: "Nueve (9)", category: "Números", lessonId: "9.1" },
  { darija: "3shra", spanish: "Diez (10)", category: "Números", lessonId: "9.1" },
  // Lesson 9.2 - Números 11-20
  { darija: "Hda3sh", spanish: "Once (11)", category: "Números", lessonId: "9.2" },
  { darija: "Tnash", spanish: "Doce (12)", category: "Números", lessonId: "9.2" },
  { darija: "Tlata3sh", spanish: "Trece (13)", category: "Números", lessonId: "9.2" },
  { darija: "Rb3ta3sh", spanish: "Catorce (14)", category: "Números", lessonId: "9.2" },
  { darija: "Khmsta3sh", spanish: "Quince (15)", category: "Números", lessonId: "9.2" },
  { darija: "3ishrin", spanish: "Veinte (20)", category: "Números", lessonId: "9.2" },
  // Lesson 10.1 - La Ciudad
  { darija: "L-mdina", spanish: "La ciudad / la medina", category: "Ciudad", lessonId: "10.1" },
  { darija: "So9", spanish: "Mercado / Zoco", category: "Ciudad", example: "Ana nmshi n-so9 (Voy al mercado)", lessonId: "10.1" },
  { darija: "Hanout", spanish: "Tienda pequeña", category: "Ciudad", lessonId: "10.1" },
  { darija: "Spetar", spanish: "Hospital", category: "Ciudad", lessonId: "10.1" },
  { darija: "Farmasia", spanish: "Farmacia", category: "Ciudad", lessonId: "10.1" },
  { darija: "Mdrasa", spanish: "Escuela / colegio", category: "Ciudad", lessonId: "10.1" },
  { darija: "Jama3", spanish: "Mezquita", category: "Ciudad", lessonId: "10.1" },
  { darija: "Bank", spanish: "Banco", category: "Ciudad", lessonId: "10.1" },
  { darija: "Mataar", spanish: "Aeropuerto", category: "Ciudad", lessonId: "10.1" },
  { darija: "Fayen l-bank 3afak?", spanish: "¿Dónde está el banco, por favor?", category: "Frases", lessonId: "10.1" },
  // Lesson 10.2 - Moverse por la ciudad
  { darija: "Zan9a", spanish: "Calle / Callejón", category: "Ciudad", lessonId: "10.2" },
  { darija: "Stasion", spanish: "Estación de tren/bus", category: "Ciudad", lessonId: "10.2" },
  { darija: "Taxi kbir", spanish: "Grand taxi (intercidades)", category: "Ciudad", lessonId: "10.2" },
  { darija: "Taxi sghir", spanish: "Petit taxi (urbano)", category: "Ciudad", lessonId: "10.2" },
  { darija: "Ana nmshi n-so9 daba", spanish: "Voy al mercado ahora", category: "Frases", lessonId: "10.2" },
  { darija: "Daba", spanish: "Ahora", category: "Tiempo", lessonId: "10.2" },
  { darija: "Imbareh", spanish: "Ayer", category: "Tiempo", lessonId: "10.2" },
  { darija: "Ghedda", spanish: "Mañana", category: "Tiempo", lessonId: "10.2" },
  // Lesson 11.1 - Futuro con Ghan
  { darija: "Ghan + verbo", spanish: "Partícula de futuro (voy a...)", category: "Futuro", example: "Ghan nshrab = voy a beber", lessonId: "11.1" },
  { darija: "Ghan nshrab atay", spanish: "Voy a tomar té", category: "Frases", lessonId: "11.1" },
  { darija: "Ghan nmshi", spanish: "Voy a ir", category: "Frases", lessonId: "11.1" },
  { darija: "Ghan nakul", spanish: "Voy a comer", category: "Frases", lessonId: "11.1" },
  { darija: "Ghan n3awnek", spanish: "Te voy a ayudar", category: "Frases", lessonId: "11.1" },
  // Lesson 11.2 - Expresiones útiles
  { darija: "Yemma Ghan n3awnek", spanish: "Mamá, te voy a ayudar", category: "Frases", lessonId: "11.2" },
  { darija: "Maxi mushkil", spanish: "No hay problema", category: "Expresiones", lessonId: "11.2" },
  { darija: "Wakha", spanish: "De acuerdo / Vale", category: "Expresiones", lessonId: "11.2" },
  { darija: "Kulshi mzian", spanish: "Todo bien", category: "Expresiones", lessonId: "11.2" },
  { darija: "Smahli", spanish: "Perdóname / Lo siento", category: "Expresiones", lessonId: "11.2" },
  { darija: "Hamdullah", spanish: "Gracias a Dios / Bien", category: "Expresiones", lessonId: "11.2" },
  { darija: "Inshallah", spanish: "Si Dios quiere / Ojalá", category: "Expresiones", lessonId: "11.2" },
  { darija: "Bla mushkil", spanish: "Sin problema", category: "Expresiones", lessonId: "11.2" },
];

const categoryEmoji: Record<string, string> = {
  "Todos": "📚", "Saludos": "👋", "Pronombres": "🧑", "Presentación": "🙋",
  "Sentimientos": "💭", "Modificadores": "⚡", "Preguntas": "❓", "Familia": "👨‍👩‍👧",
  "Casa": "🏠", "Frases": "💬", "Preposiciones": "🔗", "Comida": "🍵",
  "Verbos": "⚡", "Colores": "🎨", "Ropa": "👗", "Números": "🔢",
  "Ciudad": "🕌", "Tiempo": "🕐", "Futuro": "🚀", "Expresiones": "✨",
};

export default function DiccionarioPage() {
  const { learnedWords, isHydrated, setHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    setHydrated(true);
    setMounted(true);
  }, [setHydrated]);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando...</p>
      </div>
    );
  }

  const categories = ["Todos", ...Array.from(new Set(allVocabulary.map((v) => v.category)))];

  const hasLearnedWord = (word: string) =>
    learnedWords.some(
      (w) => w.darija.toLowerCase().split("/")[0].trim() === word.toLowerCase().split("/")[0].trim()
    );

  const filteredVocabulary = allVocabulary.filter((v) => {
    const matchCat = selectedCategory === "Todos" || v.category === selectedCategory;
    const matchSearch =
      v.darija.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.spanish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const learnedCount = filteredVocabulary.filter((v) => hasLearnedWord(v.darija)).length;

  return (
    <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-3 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-6">

        {/* Meshi bubble */}
        <section className="glass rounded-3xl px-3 py-2.5 flex items-center mt-1 overflow-hidden">
          <Meshi
            mood="normal"
            size={80}
            showBubble={true}
            bubbleText="¡Sara! Aquí tienes todo tu glosario de Darija. 🐱📚"
          />
        </section>

        {/* Stats strip */}
        <div className="flex gap-2">
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-coral flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Total</p>
              <p className="text-sm font-bold font-title text-brand-dark leading-none">{allVocabulary.length} palabras</p>
            </div>
          </div>
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Aprendidas</p>
              <p className="text-sm font-bold font-title text-brand-dark leading-none">{learnedWords.length}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en Darija o Español..."
            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border-2 border-white/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-coral shadow-sm transition-colors text-brand-dark"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const emoji = categoryEmoji[cat] ?? "📝";
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs font-title font-bold transition-all flex-shrink-0 border ${
                  isActive
                    ? "bg-gradient-to-br from-brand-saffron to-brand-coral border-brand-coral/60 text-white glow-coral"
                    : "bg-white/70 backdrop-blur-md border-white/80 text-slate-500"
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Vocabulary cards */}
        <div className="flex flex-col gap-2.5">
          {filteredVocabulary.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 glass rounded-3xl text-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <h5 className="font-bold text-sm text-brand-dark font-title">Sin resultados</h5>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                No encontramos palabras para esta búsqueda. ¡Prueba otra!
              </p>
            </div>
          ) : (
            filteredVocabulary.map((word, idx) => {
              const learned = hasLearnedWord(word.darija);
              const isExpanded = expandedIdx === idx;

              return (
                <motion.div
                  key={idx}
                  layout
                  className={`glass rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    learned ? "ring-1 ring-brand-teal/40" : ""
                  }`}
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  {/* Card header - always visible */}
                  <div className={`px-4 pt-3.5 pb-3 flex items-center gap-3 ${
                    learned ? "border-l-[3px] border-l-brand-mint" : ""
                  }`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold font-title text-brand-dark truncate">
                        {word.darija}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                        {word.spanish}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {learned ? (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Aprendida
                        </span>
                      ) : (
                        <span className="bg-slate-50 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                          Por aprender
                        </span>
                      )}
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      }
                    </div>
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-brand-cream/80 pt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-brand-coral bg-brand-pink/15 px-2 py-0.5 rounded-full">
                              {word.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              · Lección {word.lessonId}
                            </span>
                          </div>
                          {word.example && (
                            <div className="flex items-start gap-2 bg-brand-cream/60 rounded-xl p-2.5 text-[11px] text-slate-600 italic leading-relaxed">
                              <Info className="w-3.5 h-3.5 text-brand-coral flex-shrink-0 mt-0.5" />
                              <span>{word.example}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
