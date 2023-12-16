import {
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceConfig,
  fireEvent,
} from "custom-card-helpers";
import { LitElement, TemplateResult, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  EditSubElementEvent,
  EditorTarget,
  LovelaceItemConfig,
  SensorsCardConfig,
  SubElementEditorConfig,
  TAG_NAME,
} from "./types";
import { validateConfig } from "./common";

class SensorsCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false })
  hass?: HomeAssistant;
  @property({ attribute: false })
  config?: SensorsCardConfig;
  @property({ attribute: false })
  lovelace?: LovelaceConfig;
  @state()
  protected _subElementEditorConfig?: SubElementEditorConfig;

  setConfig(config: SensorsCardConfig): void {
    validateConfig(config);
    this.config = config;
  }

  protected get _configEntities(): LovelaceItemConfig[] {
    return (this.config?.entities ?? []).map((entity) => {
      return typeof entity === "string" ? { entity } : entity;
    });
  }

  protected _editDetailElement(ev: CustomEvent<EditSubElementEvent>): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  protected goBackFromSubElement() {
    this._subElementEditorConfig = undefined;
  }
  protected _entitiesChanged(
    ev: CustomEvent<{ entities?: LovelaceItemConfig[] }>,
  ) {
    ev.stopPropagation();

    if (!this.hass || !this.config || !ev.target) {
      return;
    }

    const target: EditorTarget = ev.target;
    const newConfigEntities: (LovelaceItemConfig | string)[] =
      ev.detail.entities ?? this._configEntities;

    if (this._subElementEditorConfig?.type === "row") {
      if (!target.value) {
        newConfigEntities.splice(this._subElementEditorConfig.index ?? 0, 1);
        this.goBackFromSubElement();
      } else {
        newConfigEntities[this._subElementEditorConfig.index ?? 0] =
          target.value;
      }
    }
    this.config.entities = newConfigEntities;
    fireEvent(this, "config-changed", { config: this.config });
  }

  protected _handleSubElementChanged(
    ev: CustomEvent<{ config?: LovelaceItemConfig }>,
  ): void {
    ev.stopPropagation();

    if (!this.hass || !this.config) {
      return;
    }
    const value = ev.detail.config;

    if (this._subElementEditorConfig?.type !== "row") {
      throw new TypeError(
        `Unexpected sub-element type ${this._subElementEditorConfig?.type}`,
      );
    }
    if (this._subElementEditorConfig.index === undefined) {
      throw new TypeError(`Sub element changed, but we don't know the index`);
    }

    const newConfigEntities = this._configEntities;
    if (!value) {
      newConfigEntities.splice(this._subElementEditorConfig.index, 1);
      this.goBackFromSubElement();
    } else {
      newConfigEntities[this._subElementEditorConfig.index] = value;
    }
    this.config.entities = newConfigEntities;

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value,
    };

    fireEvent(this, "config-changed", { config: this.config });
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this.config) {
      return nothing;
    }

    if (this._subElementEditorConfig?.elementConfig) {
      return html`
        <hui-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this.goBackFromSubElement.bind(this)}
          @config-changed=${this._handleSubElementChanged.bind(this)}
        ></hui-sub-element-editor>
      `;
    }

    return html`
      <hui-entities-card-row-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._entitiesChanged.bind(this)}
        @edit-detail-element=${this._editDetailElement.bind(this)}
      ></hui-entities-card-row-editor>
    `;
  }
}

(async () => {
  await customElements.whenDefined(TAG_NAME);
  if (!customElements.get(`${TAG_NAME}-editor`)) {
    customElements.define(`${TAG_NAME}-editor`, SensorsCardEditor);
  }
})().catch(console.error);
