import type JSX from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "has-rgf": IntrinsicElements.div;
      "has-rgf-inner": IntrinsicElements.div;
      "relative-time": IntrinsicElements.span & {
        datetime?: string;
        format?: string;
        tense?: string;
        prefix?: string;
      };
    }
  }
}

declare module "*/package.json" {
  export const version: string;
}
