# Auto-Create Security Incident on Missing Asset — After Business Rule (`alm_hardware` → `incident`)

## Business Problem
When an `In use` corporate hardware asset is reported `Missing` or stolen, Security and IT Operations must immediately investigate the last known custodian and impacted Configuration Item (CI). Manual ticket creation delays incident response and risks missing audit trails.

## Solution Architecture
Implemented a server-side **After Update Business Rule** on `alm_hardware` that triggers only when `install_status` transitions from `In use` (`1`) to `Missing` (`8`), automatically inserting a linked Incident record.

### Configuration
- **Name:** `LAB_After_Create_Missing_Asset_Incident`
- **Table:** Hardware (`alm_hardware`)
- **When:** `after` (Update only) | **Order:** `200`
- **Condition:** `State` changes from `In use` AND `State` changes to `Missing`

### Key Engineering Decisions
- **Why `after` instead of `before`?** Creating a child `incident` in a `Before` rule risks creating orphan Incidents if a later `Before` Business Rule or Data Policy aborts the parent `alm_hardware` save.
- **Using `previous` safely:** Captured `previous.getValue('assigned_to')` so the Incident `caller_id` identifies the last custodian even if `assigned_to` is cleared when marking the asset Missing.
- **No `current.update()`:** Only `inc.insert()` is called on the new `incident` GlideRecord, avoiding unnecessary saves or recursive loops on `alm_hardware`.

## Verification (PDI Test)
1. Selected an active `alm_hardware` record (`In use`) with both `Assigned to` and `Configuration item` populated.
2. Changed `State` to `Missing` and saved the record.
3. Confirmed the info banner displayed the generated Incident number, and verified the new `incident` record populated `caller_id` (previous custodian), `cmdb_ci`, `short_description`, and `description`.
