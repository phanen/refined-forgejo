export function wrap(element: Element, wrapper: Element): void {
  element.parentNode!.insertBefore(wrapper, element);
  wrapper.appendChild(element);
}