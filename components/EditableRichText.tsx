import { Fragment, type ReactNode } from "react";
import { textEditProps } from "@/content/site-content-types";

type EditableRichTextProps = {
  id: string;
  value: string;
  className?: string;
  countValue?: number;
};

function keepMiddotWithPreviousWord(value: string) {
  return value.replace(/ ([·])/g, " $1");
}

export function renderRichText(value: string, countValue?: number): ReactNode {
  let strongIndex = 0;
  return value.split("\n").map((line, lineIndex, lines) => {
    const parts: ReactNode[] = [];
    const pattern = /\*\*([^*]+)\*\*/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line))) {
      if (match.index > cursor) parts.push(keepMiddotWithPreviousWord(line.slice(cursor, match.index)));
      parts.push(<strong key={`${lineIndex}-${match.index}`} data-motion-count={strongIndex++ === 0 ? countValue : undefined}>{keepMiddotWithPreviousWord(match[1])}</strong>);
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

export function EditableRichText({ id, value, className, countValue }: EditableRichTextProps) {
  return (
    <span className={className} {...textEditProps(id, true)}>
      {renderRichText(value, countValue)}
    </span>
  );
}
