"use client";

import { useState } from "react";

export type HomeAnsweredQuestion = {
  id: string;
  q: string;
  answer: string;
};

export function HomeAnsweredQuestions({ questions }: { questions: HomeAnsweredQuestion[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ol>
      {questions.map((question, index) => {
        const open = openId === question.id;
        const buttonId = `${question.id}-trigger`;
        const panelId = `${question.id}-answer`;

        return (
          <li key={question.id} data-home-answer-open={open ? "true" : "false"}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId((current) => current === question.id ? null : question.id)}
            >
              <small>Q{index + 1}</small>
              <b>{question.q}</b>
              <span>{open ? "닫기 −" : "답 보기 +"}</span>
            </button>
            <div id={panelId} role="region" aria-labelledby={buttonId} data-home-answer-panel aria-hidden={!open}>
              <div><p>{question.answer}</p></div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
