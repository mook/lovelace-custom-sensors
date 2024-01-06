/**
 * This file is selectively copied from
 * frontend.git/src/panels/lovelace/common/directives/action-handler-directive.ts
 */

import { ActionHandlerOptions } from "custom-card-helpers";
import { noChange } from "lit";
import {
  AttributePart,
  Directive,
  DirectiveParameters,
  directive,
} from "lit/directive.js";

interface ActionHandlerType extends HTMLElement {
  holdTime: number;
  bind(element: Element, options?: ActionHandlerOptions): void;
}
interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleKeyDown?: (ev: KeyboardEvent) => void;
  };
}

const getActionHandler = (): ActionHandlerType => {
  const body = document.body;
  const existing = body.querySelector("action-handler");
  if (existing) {
    return existing as ActionHandlerType;
  }

  const actionhandler = document.createElement("action-handler");
  body.appendChild(actionhandler);

  return actionhandler as ActionHandlerType;
};

export const actionHandlerBind = (
  element: ActionHandlerElement,
  options?: ActionHandlerOptions,
) => {
  getActionHandler().bind(element, options);
};

export const actionHandler = directive(
  class extends Directive {
    update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used for typing.
    render(_options?: ActionHandlerOptions) {
      /* nothing */
    }
  },
);
