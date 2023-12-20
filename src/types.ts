/**
 * @license
 * Copyright 2023 Mook
 * SPDX-License-Identifier: Apache-2.0
 */

import { LovelaceCardConfig } from "custom-card-helpers";
import { LitElement } from "lit";

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

export type CustomElement<T, base = LitElement> = base & T;
