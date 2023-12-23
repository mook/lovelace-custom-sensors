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
  /**
   * Timer that signifies the point at which we should give up trying to refresh
   * from not having any entities.  When this is undefined, we should not
   * attempt a refresh.
   */
  protected refreshTimeout: ReturnType<typeof setTimeout> | undefined;
  /**
   * If we fail to load any entities, timer used to retry.
   */
  protected refreshTimer: ReturnType<typeof setTimeout> | undefined;

  public getCardSize(): number {
    // Size 1 when we have entities, else 0.
    return this.entities.length > 0 ? 1 : 0;
  }

  public setConfig(config: SensorsCardConfig): void {
    validateConfig(config);
    clearTimeout(this.refreshTimeout);
    clearTimeout(this.refreshTimer);
    this.refreshTimeout = setTimeout(() => {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }, 60_000);
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
    clearTimeout(this.refreshTimer);
    if (!this.hass || !this.config) {
      if (this.refreshTimeout !== undefined) {
        this.refreshTimer = setTimeout(() => {
          this.requestUpdate();
        }, 1_000);
      }
      return nothing;
    }
    const templates = this.entities.map((e) => this.renderEntity(e.entity));

    if (this.refreshTimeout !== undefined) {
      if (templates.length > 0 && templates.some((t) => t === nothing)) {
        // We erroneously have no state; try again later.
        this.refreshTimer = setTimeout(() => {
          this.requestUpdate();
        }, 1_000);
      } else {
        // We have rendered successfully.
        clearInterval(this.refreshTimeout);
        this.refreshTimeout = undefined;
      }
    }
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
