"use client";

import { textEditProps } from "@/content/site-content-types";

type HomeQuestionTriggerProps = {
  className?: string;
  editId: string;
  label: string;
};

export function HomeQuestionTrigger({ className, editId, label }: HomeQuestionTriggerProps) {
  const openQuestion = () => {
    window.dispatchEvent(new Event("glory:open-home-question"));
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("#question")?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    });
  };

  return <button type="button" className={className} onClick={openQuestion} data-edit-control><span {...textEditProps(editId)}>{label}</span></button>;
}
