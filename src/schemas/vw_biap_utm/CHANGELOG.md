# vw_biap_utm

## Version 2.0.0

| Column       | Type | Nullable | Confidential | Description                 | Notes |
| ------------ | ---- | -------- | ------------ | --------------------------- | ----- |
| analytics_id | uuid | NO       | NO           | Unique analytics identifier |       |


## Version 1.0.0

| Column            | Type      | Nullable | Confidential | Description                 | Notes      |
| ----------------- | --------- | -------- | ------------ | --------------------------- | ---------- |
| analytics_id      | uuid      | NO       | NO           | Unique analytics identifier |            |
| participant_id    | uuid      | NO       | YES          | Participant UUID            | Not the PK |
| year_of_birth     | integer   | YES      | YES          | Derived from DOB            |            |
| postcode_district | text      | YES      | YES          | Derived from postcode       |            |
| postcode_sector   | text      | YES      | YES          | Derived from postcode       |            |
| ethnicity         | text      | YES      | YES          | Mapped from ethnicity key   |            |
| is_deceased       | boolean   | NO       | NO           | Defaults to false           |            |
| created_at        | timestamp | NO       | NO           | Creation timestamp          |            |
| last_modified     | timestamp | NO       | NO           | Last modified timestamp     |            |

