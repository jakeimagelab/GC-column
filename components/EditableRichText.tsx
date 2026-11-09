import { Fragment, type ReactNode } from "react";
import { textEditProps } from "@/content/site-content-types";

type EditableRichTextProps = {
  id: string;
  value: string;
  className?: string;
};

function keepMiddotWithPreviousWord(value: string) {
  return value.replace(/ ([·])/g, " $1");
}

export function renderRichText(value: string): ReactNode {
  return value.split("\n").map((line, lineIndex, lines) => {
    const parts: ReactNode[] = [];
    const pattern = /\*\*([^*]+)\*\*/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line))) {
      if (match.index > cursor) parts.push(keepMiddotWithPreviousWord(line.slice(cursor, match.index)));
      parts.push(<strong key={`${lineIndex}-${match.index}`}>{keepMiddotWithPreviousWord(match[1])}</strong>);
      cursor = match.index + match[0].length;
    }
    if (cursor < line.length) parts.push(keepMiddotWithPreviousWord(line.slice(cursor)));

    return (
      <Fragment key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </Fragment>
    );
  });
}

export function EditableRichText({ id, value, className }: EditableRichTextProps) {
  return (
    <span className={className} {...textEditProps(id, true)}>
      {renderRichText(value)}
    </span>
  );
}
