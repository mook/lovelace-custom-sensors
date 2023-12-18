import SensorsCard from "./card";
import SensorsCardEditor from "./editor";
import { TAG_NAME } from "./types";

(async () => {
  try {
    await customElements.whenDefined("ha-state-label-badge");
    if (!customElements.get(TAG_NAME)) {
      customElements.define(TAG_NAME, SensorsCard);
    }
    if (!customElements.get(`${TAG_NAME}-editor`)) {
      customElements.define(`${TAG_NAME}-editor`, SensorsCardEditor);
    }
  } catch (ex) {
    console.error(`Error registering <${TAG_NAME}>:`, ex);
  }
})().catch(console.error);
