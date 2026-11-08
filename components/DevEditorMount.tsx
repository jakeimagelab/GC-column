import type { SiteContent } from "@/content/site-content-types";
import { DevEditor } from "./DevEditor";

type DevEditorMountProps = {
  page: "home" | "column";
  content: SiteContent;
};

export function DevEditorMount(props: DevEditorMountProps) {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevEditor {...props} />;
}
