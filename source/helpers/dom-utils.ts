export function wrap(element: Element, wrapper: Element): void {
  element.parentNode!.insertBefore(wrapper, element);
  wrapper.appendChild(element);
}

export const isEditable = (node: unknown): boolean =>
  node instanceof HTMLTextAreaElement
  || node instanceof HTMLInputElement
  || (node instanceof HTMLElement && node.isContentEditable);
