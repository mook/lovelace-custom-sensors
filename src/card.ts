/**
 * @license
 * Copyright 2023 Mook
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, TemplateResult, css, html, nothing } from "lit";
import { LovelaceItemConfig, SensorsCardConfig, TAG_NAME } from "./types";
import {
  ActionHandlerEvent,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
  computeStateDisplay,
  handleAction,
  hasAction,
} from "custom-card-helpers";
import { property, state } from "lit/decorators.js";
import { validateConfig } from "./common";
import { actionHandler } from "./action-handler";
import { classMap } from "lit/directives/class-map.js";

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

  private _handleAction(ev: ActionHandlerEvent) {
    const target = ev.currentTarget;
    const entity = target && "entity" in target ? target.entity : undefined;
    const actionConfig =
      target && "actionConfig" in target ? target.actionConfig : undefined;

    if (!this.hass || typeof entity !== "string" || !actionConfig) {
      return;
    }
    handleAction(
      this,
      this.hass,
      { ...this.config, ...actionConfig, entity },
      ev.detail.action,
    );
  }

  protected renderEntity(
    item: LovelaceItemConfig,
  ): TemplateResult | typeof nothing {
    const state = this.hass?.states[item.entity];

    if (!this.hass) {
      return nothing;
    }

    if (!state?.state || state.state === "unavailable") {
      let message: string;

      if (!state?.state) {
        message = this.hass.localize(
          "ui.panel.lovelace.warning.entity_not_found",
          { entity: item.entity },
        );
      } else {
        const name = state.attributes.friendly_name ?? item;
        message = this.hass.localize(
          "ui.panel.lovelace.warning.entity_unavailable",
          { entity: name },
        );
      }
      return html`
        <hui-warning-element label=${message}> </hui-warning-element>
      `;
    }

    const actionConfig = {
      tap_action: item.tap_action ??
        this.config?.tap_action ?? { action: "more-info" },
      hold_action: item.hold_action ?? this.config?.hold_action,
      double_tap_action:
        item.double_tap_action ?? this.config?.double_tap_action,
    };

    return html`
      <label
        class="sensor-state ${classMap({
          "has-action": hasAction(actionConfig.tap_action),
        })}"
        .actionConfig=${actionConfig}
        .entity=${item.entity}
        @action=${this._handleAction.bind(this)}
        .actionHandler=${actionHandler({
          hasHold: hasAction(actionConfig.hold_action),
          hasDoubleClick: hasAction(actionConfig.double_tap_action),
        })}
      >
        <ha-state-icon .state=${state}></ha-state-icon>
        ${computeStateDisplay(this.hass.localize, state, this.hass.locale)}
      </label>
    `;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this.config) {
      return nothing;
    }
    const templates = this.entities.map((e) => this.renderEntity(e));

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
    .sensor-state.has-action {
      cursor: pointer;
    }
  `;
}
