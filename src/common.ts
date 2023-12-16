/**
 * @license
 * Copyright 2023 Mook
 * SPDX-License-Identifier: Apache-2.0
 */

import { SensorsCardConfig, TAG_NAME } from "./types";

/**
 * Validate the configuration.
 * @param config The configuration to validate.
 * @throws If there are validation errors.
 */
export function validateConfig(config: SensorsCardConfig): void {
  // While Lovelace has special handling for `superstruct`-generated errors,
  // because we're external we end up with a different constructor and
  // therefore never end up in thw special handling path.  It ends up better
  // to just throw plain errors instead.
  if ((config.type as unknown) !== `custom:${TAG_NAME}`) {
    throw new Error(`Configuration is for ${config.type}, not ${TAG_NAME}`);
  }
  if (
    typeof config.entities !== "undefined" &&
    !Array.isArray(config.entities)
  ) {
    throw new Error(`.entities should be a list of entities`);
  }
  for (const [i, entity] of Object.entries(config.entities ?? [])) {
    if (typeof entity === "string") {
      continue;
    }
    if ((typeof entity as unknown) !== "object" || (!entity as unknown)) {
      throw new Error(`.entities[${i}] is not a string or object`);
    }
    if (typeof entity.entity !== "string") {
      throw new Error(`.entities[${i}].entity is not a string`);
    }
  }
}
