import "./help-modal.css";
import React, { Fragment } from "dom-chef";
import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { shortcutMap } from "../helpers/feature-helpers.js";

function showHelpModal(): void {
  if (document.querySelector(".rgf-help-modal-backdrop")) {
    return;
  }

  const shortcuts = Array.from(shortcutMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const modal = (
    <div className="rgf-help-modal-backdrop" onClick={closeModal}>
      <div className="rgf-help-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <header className="rgf-help-modal-header">
          <h3>Keyboard shortcuts</h3>
          <button type="button" onClick={closeModal}>&times;</button>
        </header>
        <div className="rgf-help-modal-content">
          <table className="rgf-shortcut-table">
            <tbody>
              {shortcuts.map(([hotkey, description]) => (
                <tr key={hotkey}>
                  <td className="rgf-shortcut-key">
                    {hotkey.split(" ").map((key, i) => (
                      <Fragment key={i}>
                        {i > 0 && " then "}
                        <kbd>{key}</kbd>
                      </Fragment>
                    ))}
                  </td>
                  <td className="rgf-shortcut-description">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  document.body.append(modal);
  document.body.classList.add("rgf-modal-open");

  const handleEsc = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      closeModal();
      window.removeEventListener("keydown", handleEsc);
    }
  };
  window.addEventListener("keydown", handleEsc);
}

function closeModal(event?: React.MouseEvent | MouseEvent): void {
  if (event && "preventDefault" in event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const modal = document.querySelector(".rgf-help-modal-backdrop");
  if (modal) {
    modal.remove();
    document.body.classList.remove("rgf-modal-open");
  }
}

// TODO(upstream): https://codeberg.org/forgejo/forgejo/pulls/12409
function init(signal: AbortSignal): void {
  registerHotkey("?", showHelpModal, { signal });
}

void features.add(import.meta.url, {
  shortcuts: {
    "?": "Show this help modal",
  },
  init,
});
