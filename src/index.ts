import SensorsCard from "./card";
import SensorsCardEditor from "./editor";
import { TAG_NAME } from "./types";

try {
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, SensorsCard);
  }
  if (!customElements.get(`${TAG_NAME}-editor`)) {
    customElements.define(`${TAG_NAME}-editor`, SensorsCardEditor);
  }
  // Force a rebuild to avoid issues with this sometimes not appearing due to
  // a race when loading.  Note that getLovelace() doesn't return the correct
  // element, so we need to roll our own...
  const reloadInterval = setInterval(() => {
    const selectors = [
      "home-assistant",
      "home-assistant-main",
      "app-drawer-layout partial-panel-resolver",
      "ha-panel-lovelace",
      "hui-root",
      "#view",
    ];
    let element = document.documentElement;
    for (const selector of selectors) {
      element =
        (element.shadowRoot ?? element).querySelector(selector) ?? element;
    }
    if (element.id !== "view") {
      return;
    }
    element.dispatchEvent(new Event("ll-rebuild"));
    clearInterval(reloadInterval);
  }, 500);
} catch (ex) {
  console.error(`Error registering <${TAG_NAME}>:`, ex);
}
