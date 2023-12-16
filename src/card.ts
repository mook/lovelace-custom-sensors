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
import { state } from "lit/decorators.js";
import { validateConfig } from "./common";
import {} from "./editor";

/**
 * SensorsCard implements a Lovelace card that displays the sensor data in a
 * row.
 */
class SensorsCard extends LitElement implements LovelaceCard {
  @state()
  _hass?: HomeAssistant;
  @state()
  _config?: SensorsCardConfig;

  readonly isPanel = false;
  editMode?: boolean;

  public getCardSize(): number {
    // Size 1 when we have entities, else 0.
    return this.entities.length > 0 ? 1 : 0;
  }

  public setConfig(config: SensorsCardConfig): void {
    validateConfig(config);
    this._config = config;
  }

  get hass() {
    if (!this._hass) {
      throw new Error("No hass!");
    }
    return this._hass;
  }
  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  get entities(): LovelaceItemConfig[] {
    return (this._config?.entities ?? []).map((e) =>
      typeof e === "string" ? { entity: e } : e,
    );
  }

  protected renderEntity(entity: string): TemplateResult | typeof nothing {
    const state = this.hass.states[entity] as
      | (typeof this.hass.states)[string]
      | undefined;

    if (!state?.state) {
      return nothing;
    }

    if (state.state === "unavailable") {
      const name = state.attributes.friendly_name ?? entity;
      const message = this.hass.localize(
        "ui.panel.lovelace.warning.entity_unavailable",
        { entity: name },
      );
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
    if (!this._hass || !this._config) {
      return nothing;
    }
    return html`<div id="sensors">
      ${this.entities.map((e) => this.renderEntity(e.entity))}
    </div>`;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await customElements.whenDefined(`${TAG_NAME}-editor`);
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

(async () => {
  try {
    await customElements.whenDefined("ha-state-label-badge");
    if (!customElements.get(TAG_NAME)) {
      customElements.define(TAG_NAME, SensorsCard);
    }
  } catch (ex) {
    console.error(`Error registering <${TAG_NAME}>:`, ex);
  }
})().catch(console.error);
