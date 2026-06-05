"use client";

import React from "react";
import { Exercise } from "../../data/lessons";
import { MultipleChoice } from "./MultipleChoice";
import { Translation } from "./Translation";
import { MatchPairs } from "./MatchPairs";
import { FillBlank } from "./FillBlank";
import { WordOrder } from "./WordOrder";
import { TrueFalse } from "./TrueFalse";
import { Flashcard } from "./Flashcard";
import { Conversation } from "./Conversation";
import { ListeningSelect } from "./ListeningSelect";
import { ListenType } from "./ListenType";

interface ExerciseRendererProps {
  exercise: Exercise;
  selectedAnswer: any;
  onSelect: (ans: any) => void;
  isAnswerChecked: boolean;
  onFlip?: (flipped: boolean) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  onFlip,
}) => {
  switch (exercise.type) {
    case "multiple-choice":
      return (
        <MultipleChoice
          question={exercise.question || "¿Qué significa esta palabra?"}
          options={exercise.options || []}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswer={exercise.answer as string}
        />
      );

    case "translation":
      return (
        <Translation
          question={exercise.question || "Traduce la siguiente expresión:"}
          selectedAnswer={(selectedAnswer as string) || ""}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswers={exercise.answer as string[]}
        />
      );

    case "match-pairs":
      return (
        <MatchPairs
          question={exercise.question || "Empareja las palabras correspondientes:"}
          pairs={exercise.pairs || []}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
        />
      );

    case "fill-blank":
      return (
        <FillBlank
          question={exercise.question || "Completa el hueco de la frase:"}
          sentenceWithBlank={exercise.sentenceWithBlank || ""}
          options={exercise.options || []}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswer={exercise.answer as string}
        />
      );

    case "word-order":
      return (
        <WordOrder
          question={exercise.question || "Ordena las palabras para formar la frase:"}
          words={exercise.words || []}
          orderedAnswer={exercise.orderedAnswer || []}
          translation={exercise.translation || ""}
          selectedAnswer={selectedAnswer || []}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
        />
      );

    case "true-false":
      return (
        <TrueFalse
          question={exercise.question || "¿Es verdadera o falsa la afirmación?"}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswer={exercise.answer as boolean}
        />
      );

    case "flashcard-reveal":
      return (
        <Flashcard
          question={exercise.question || "Intenta recordar el significado de esta expresión:"}
          front={exercise.front || ""}
          back={exercise.back || ""}
          hint={exercise.hint}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          onFlip={onFlip}
        />
      );

    case "conversation":
      return (
        <Conversation
          question={exercise.question || "Completa la conversación:"}
          dialogue={exercise.dialogue || []}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
        />
      );

    case "listening-select":
      return (
        <ListeningSelect
          question={exercise.question || "Escucha e identifica la palabra:"}
          audioText={exercise.audioText || ""}
          options={exercise.options || []}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswer={exercise.answer as string}
        />
      );

    case "listen-type":
      return (
        <ListenType
          question={exercise.question || "Escucha y escribe lo que oíste:"}
          audioText={exercise.audioText || ""}
          hint={exercise.hint}
          selectedAnswer={(selectedAnswer as string) || ""}
          onSelect={onSelect}
          isAnswerChecked={isAnswerChecked}
          correctAnswers={(exercise.answer as string[]) || []}
        />
      );

    default:
      return (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-xl">
          Tipo de ejercicio no soportado: &quot;{(exercise as any).type}&quot;
        </div>
      );
  }
};
export default ExerciseRenderer;
