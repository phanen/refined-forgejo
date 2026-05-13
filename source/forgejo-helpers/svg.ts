const icons: Record<string, string> = {
  "octicon-check":
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="svg octicon-check" width="16" height="16" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0"/></svg>`,

  "octicon-dot-fill":
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="svg octicon-dot-fill" width="16" height="16" aria-hidden="true"><path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8"/></svg>`,

  "octicon-x":
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="svg octicon-x" width="16" height="16" aria-hidden="true"><path d="M3.72 3.72a.751.751 0 0 1 1.042.018L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.042-.018.75.75 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06"/></svg>`,
};

export function svg(name: string, size = 16): string {
  let raw = icons[name];
  if (!raw) {
    throw new Error(`Unknown SVG: ${name}`);
  }

  if (size !== 16) {
    raw = raw.replace(/width="16"/, `width="${size}"`).replace(/height="16"/, `height="${size}"`);
  }

  return raw;
}
