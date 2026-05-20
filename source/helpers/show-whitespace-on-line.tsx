import React from "dom-chef";

function getTextNodes(element: Node): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node;

  do {
    node = walker.nextNode();
    if (node) {
      nodes.push(node as Text);
    }
  } while (node);

  return nodes;
}

export default function showWhiteSpacesOnLine(line: Element, shouldAvoidSurroundingSpaces = false): Element {
  const textNodesOnThisLine = getTextNodes(line);
  for (const [nodeIndex, textNode] of textNodesOnThisLine.entries()) {
    let text = textNode.textContent ?? "";
    if (text.length > 1000) {
      continue;
    }

    const isLeading = nodeIndex === 0;
    const isTrailing = nodeIndex === textNodesOnThisLine.length - 1;

    const startingCharacterIndex = shouldAvoidSurroundingSpaces && isLeading ? 1 : 0;
    const skipLastCharacter = shouldAvoidSurroundingSpaces && isTrailing;
    const endingCharacterIndex = text.length - 1 - Number(skipLastCharacter);

    for (let index = endingCharacterIndex; index >= startingCharacterIndex; index--) {
      const thisCharacter = text[index];
      const endingIndex = index;

      if (thisCharacter !== " " && thisCharacter !== "\t") {
        continue;
      }

      while (text[index - 1] === thisCharacter && index !== startingCharacterIndex) {
        index--;
      }

      if (!isLeading && !isTrailing && index === endingIndex && thisCharacter === " ") {
        continue;
      }

      if (endingIndex < text.length - 1) {
        textNode.splitText(endingIndex + 1);
      }

      textNode.splitText(index);
      text = textNode.textContent;

      textNode.after(
        <span data-rgf-whitespace={thisCharacter === "\t" ? "tab" : "space"}>
          {textNode.nextSibling}
        </span>,
      );
    }
  }

  return line;
}
