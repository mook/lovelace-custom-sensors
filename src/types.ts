import { LovelaceCardConfig } from "custom-card-helpers";

/**
 * The tag name to trigger this custom element.
 */
export const TAG_NAME = "sensors-header-footer";

/**
 * An entity definition for a sensor, when we're not using a plain string.
 */
export interface LovelaceItemConfig {
  entity: string;
}

/**
 * Configuration for a given card.
 */
export interface SensorsCardConfig extends LovelaceCardConfig {
  type: `custom:${typeof TAG_NAME}`;
  entities?: (LovelaceItemConfig | string)[];
}

/**
 * EditorTarget is a stub for the real type, defined at
 * src/panels/lovelace/editor/types.ts
 */
export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement["type"];
  config?: unknown; // ActionConfig is not supported
}

export interface SubElementEditorConfig {
  index?: number;
  elementConfig?: LovelaceItemConfig;
  type: "row"; // We do not support "header", "footer", "feature".
}

export interface EditSubElementEvent {
  subElementConfig: SubElementEditorConfig;
}
