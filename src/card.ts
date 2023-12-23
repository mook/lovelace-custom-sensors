/**
 * @license
 * Copyright 2023 Mook
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, TemplateResult, css, html, nothing } from "lit";
import { LovelaceItemConfig, SensorsCardConfig, TAG_NAME } from "./types";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
  computeStateDisplay,
} from "custom-card-helpers";
import { property, state } from "lit/decorators.js";
import { validateConfig } from "./common";

/**
 * SensorsCard implements a Lovelace card that displays the sensor data in a
 * row.
 */
export default class SensorsCard extends LitElement implements LovelaceCard {
  @property({ attribute: false })
  hass?: HomeAssistant;
  @state()
  config?: SensorsCardConfig;

  readonly isPanel = false;
  editMode?: boolean;

  public getCardSize(): number {
    // Size 1 when we have entities, else 0.
    return this.entities.length > 0 ? 1 : 0;
  }

  public setConfig(config: SensorsCardConfig): void {
    validateConfig(config);
    this.config = config;
  }

  get entities(): LovelaceItemConfig[] {
    return (this.config?.entities ?? []).map((e) =>
      typeof e === "string" ? { entity: e } : e,
    );
  }

  protected renderEntity(entity: string): TemplateResult | typeof nothing {
    const state = this.hass?.states[entity];

    if (!this.hass) {
      return nothing;
    }

    if (!state?.state || state.state === "unavailable") {
      let message: string;

      if (!state?.state) {
        message = this.hass.localize(
          "ui.panel.lovelace.warning.entity_not_found",
          { entity },
        );
      } else {
        const name = state.attributes.friendly_name ?? entity;
        message = this.hass.localize(
          "ui.panel.lovelace.warning.entity_unavailable",
          { entity: name },
        );
      }
      return html`
        <hui-warning-element label=${message}> </hui-warning-element>
      `;
    }

    return html`
      <label class="sensor-state">
        <ha-state-icon .state=${state}></ha-state-icon>
        ${computeStateDisplay(this.hass.localize, state, this.hass.locale)}
      </label>
    `;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this.config) {
      return nothing;
    }
    const templates = this.entities.map((e) => this.renderEntity(e.entity));

    return html`<div id="sensors">${templates}</div>`;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await Promise.race([
      new Promise((_, reject) =>
        setTimeout(() => {
          reject(new Error("Failed to load editor"));
        }, 1_000),
      ),
      customElements.whenDefined(`${TAG_NAME}-editor`),
    ]);
    return document.createElement(`${TAG_NAME}-editor`) as LovelaceCardEditor;
  }

  static override readonly styles = css`
    :host {
      --mdc-icon-size: 16px;
    }
    #sensors {
      text-align: end;
      padding: 16px 20px;
    }
    .sensor-state {
      margin: 0 4px 4px;
    }
  `;
}
