import type JSX from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "has-rgf": IntrinsicElements.div;
      "has-rgf-inner": IntrinsicElements.div;
    }
  }
}

declare module "*/package.json" {
  export const version: string;
}
