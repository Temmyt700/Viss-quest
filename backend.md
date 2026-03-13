# VissQuest Draw Control Notes

## Draw Fields

The `draws` table should support:

- `draw_id`
- `title`
- `description`
- `entry_fee`
- `max_entries`
- `current_entries`
- `status`
- `start_time`
- `end_time`
- `created_at`

## Supported Draw Status Values

- `available`
- `almost_filled`
- `closing_soon`
- `limited_slots`
- `filled`
- `closed`

## Backend Rules

- Draw countdown must be based on backend/server time.
- When `end_time` is reached, the draw closes automatically.
- When `current_entries >= max_entries`, status becomes `filled`.
- Filled or closed draws must reject new entries.
- Admin can manually override draw status before automatic fill/close happens.

## Automatic Urgency Logic

Suggested default thresholds:

- Below 75% -> `available`
- 75% -> `almost_filled`
- 90% -> `limited_slots`
- 95% -> `closing_soon`
- 100% -> `filled`

Admin override should take precedence over the automatic urgency value.
