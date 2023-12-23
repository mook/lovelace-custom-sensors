/**
 * @license
 * Copyright 2023 Mook
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceConfig,
  fireEvent,
} from "custom-card-helpers";
import {
  CSSResultGroup,
  LitElement,
  TemplateResult,
  css,
  html,
  nothing,
} from "lit";
import { property, state } from "lit/decorators.js";
import { CustomElement, LovelaceItemConfig, SensorsCardConfig } from "./types";
import { validateConfig } from "./common";
import { repeat } from "lit/directives/repeat.js";
import Sortable, { SortableEvent } from "sortablejs";

export default class SensorsCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false })
  hass?: HomeAssistant;
  @state()
  protected config?: SensorsCardConfig;
  @property({ attribute: false })
  lovelace?: LovelaceConfig;
  protected _sortable?: Sortable;

  protected override firstUpdated(): void {
    this._createSortable();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._sortable?.destroy();
    this._sortable = undefined;
  }

  setConfig(config: SensorsCardConfig): void {
    validateConfig(config);
    this.config = config;
  }

  protected _t(key: string): string {
    if (!this.hass) {
      return key;
    }
    return this.hass.localize(`ui.panel.lovelace.editor.card.${key}`);
  }

  protected get entities(): LovelaceItemConfig[] {
    return (this.config?.entities ?? []).map((entity) => {
      return typeof entity === "string" ? { entity } : entity;
    });
  }

  protected _rowChanged(ev: CustomEvent<{ value: string }>) {
    ev.stopPropagation();
    if (!this.config || !ev.target) {
      return;
    }

    const value = ev.detail.value;
    const index: number = (ev.target as CustomElement<{ index: number }>).index;
    const entities = this.entities;

    if (!value) {
      entities.splice(index, 1);
    } else {
      entities[index] = {
        ...entities[index],
        entity: value,
      };
    }
    this.config = { ...this.config, entities };
    fireEvent(this, "config-changed", { config: this.config });
  }

  protected _rowMoved(ev: SortableEvent) {
    if (!this.config) {
      return;
    }
    if (
      typeof ev.oldIndex === "undefined" ||
      typeof ev.newIndex === "undefined"
    ) {
      return;
    }
    if (ev.oldIndex === ev.newIndex) {
      return;
    }

    const entities = this.entities;
    entities.splice(ev.newIndex, 0, entities.splice(ev.oldIndex, 1)[0]);

    this.config = { ...this.config, entities };
    fireEvent(this, "config-changed", { config: this.config });
  }

  protected _removeRow(ev: CustomEvent) {
    if (!this.config || !ev.currentTarget) {
      return;
    }

    const index = (ev.currentTarget as CustomElement<{ index: number }>).index;
    const entities = this.entities;
    entities.splice(index, 1);

    this.config = { ...this.config, entities };
    fireEvent(this, "config-changed", { config: this.config });
  }

  protected _addEntity(ev: CustomEvent<{ value: string }>) {
    const value = ev.detail.value;

    if (!this.hass || !this.config || !ev.target || !value) {
      return;
    }

    const entities = this.entities.concat({ entity: value });
    this.config = { ...this.config, entities };
    (ev.target as HTMLInputElement).value = "";
    fireEvent(this, "config-changed", { config: this.config });
  }

  protected _createSortable() {
    const entitiesElem = this.shadowRoot?.getElementById("entities");

    if (!entitiesElem) {
      throw new Error("No entities element, can't create sortable");
    }
    this._sortable = new Sortable(entitiesElem, {
      animation: 150,
      fallbackClass: "sortable-fallback",
      handle: ".handle",
      onChoose: (event) => {
        const item = event.item as CustomElement<
          { placeholder?: Comment },
          HTMLElement
        >;
        const placeholder = document.createComment("sort-placeholder");
        item.placeholder = placeholder;
        event.item.after(placeholder);
      },
      onEnd: (event) => {
        const item = event.item as CustomElement<{ placeholder?: Comment }>;
        if (item.placeholder) {
          item.placeholder.replaceWith(item);
          delete item.placeholder;
        }
        this._rowMoved(event);
      },
    });
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this.config) {
      return nothing;
    }

    return html`
      <h3>${this._t("generic.entities")} (${this._t("config.required")})</h3>
      <div id="entities">
        ${repeat(
          this.entities,
          (e) => e.entity,
          (e, index) => html`
            <div class="entity">
              <div class="handle">
                <ha-icon icon="mdi:drag"></ha-icon>
              </div>
              <ha-entity-picker
                allow-custom-entity
                hideClearIcon
                .hass=${this.hass}
                .value=${e.entity}
                .index=${index}
                @value-changed=${this._rowChanged.bind(this)}
              ></ha-entity-picker>
              <ha-icon-button
                .label=${this.hass?.localize(
                  "ui.components.entity.entity-picker.clear",
                )}
                class="remove-icon"
                .index=${index}
                @click=${this._removeRow.bind(this)}
                ><ha-icon icon="mdi:close"></ha-icon
              ></ha-icon-button>
            </div>
          `,
        )}
      </div>
      <ha-entity-picker
        class="add-entity"
        .hass=${this.hass}
        @value-changed=${this._addEntity.bind(this)}
      ></ha-entity-picker>
    `;
  }

  static override readonly styles: CSSResultGroup = css`
    ha-entity-picker {
      margin-top: 8px;
    }
    .add-entity {
      display: block;
      margin-left: 32px;
      margin-right: 36px;
      margin-inline-start: 32px;
      margin-inline-end: 36px;
      direction: var(--direction);
    }
    .entity {
      display: flex;
      align-items: center;
    }
    .entity .handle {
      padding-right: 8px;
      cursor: move;
      padding-inline-end: 8px;
      padding-inline-start: initial;
      direction: var(--direction);
    }
    .entity .handle > * {
      pointer-events: none;
    }
    .entity ha-entity-picker {
      flex-grow: 1;
    }
    .remove-icon {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
    }
    .secondary {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;
}
