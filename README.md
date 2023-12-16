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

## Configuration

| Key        | Type   | Description                                        |
| ---------- | ------ | -------------------------------------------------- |
| `type`     | string | Must be `custom:sensors-header-footer` to be used. |
| `entities` | list   | A list of entity IDs or `entity` objects.          |

## Thanks

Lots of code is copied from Lovelace directly.
