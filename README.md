# lovelace-custom-sensors

This is a custom element for [Lovelace] (Home Assistant frontend) to display
sensors in a row. It is designed to be used in a footer of another card.

[Lovelace]: https://www.home-assistant.io/docs/frontend/

## Example

```yaml
# A normal entities card
type: entities
title: Living Room
entities:
  - light.living_room
footer:
  # ... With a custom footer
  type: custom:sensors-header-footer
  entities:
    - sensor.living_room_temperature
    - entity: sensor.living_room_humidity
```

![Screenshot of the component in use](docs/screenshot.png)

## Configuration

| Key        | Type   | Description                                        |
| ---------- | ------ | -------------------------------------------------- |
| `type`     | string | Must be `custom:sensors-header-footer` to be used. |
| `entities` | list   | A list of entity IDs or `entity` objects.          |

## Development

1. This depends on NodeJS & yarn:
   1. This was developed on NodeJS 20.
   1. Run `corepack enable` to have `yarn`.
1. Run `yarn dev` for a development server.
1. Add as an [extra Lovelace module]:

   ```yaml
   # configuration.yaml
   frontend:
     extra_module_url:
       - http://127.0.0.1:4173/custom-sensors.js
   ```

[extra Lovelace module]: https://www.home-assistant.io/integrations/frontend/#extra_module_url

## Thanks

Lots of code is copied from Lovelace directly.
