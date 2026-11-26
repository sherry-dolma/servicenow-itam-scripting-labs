***# Silent Asset Segregation — Before Query Business Rule (`alm_asset`)

## Business Problem
While Read ACLs restrict unauthorized users from viewing enterprise asset records, ACLs display a `"Number of rows removed from this list by Security constraints"` banner and are bypassed by server-side `GlideRecord` scripts. When strict silent record segregation is required for non-ITAM users across `alm_asset` and child tables like `alm_hardware`, a Before Query Business Rule is needed.

## Solution Architecture
Implemented a **Before Query Business Rule** on `alm_asset` that silently appends an `assigned_to` filter whenever an interactive user without `asset` or `admin` roles queries asset records.

### Configuration
- **Name:** `LAB_Query_Restrict_Asset_Access`
- **Table:** Asset (`alm_asset`) — applies automatically to extended tables (`alm_hardware`)
- **When:** `before` (`Query` checked; Insert/Update/Delete unchecked) | **Order:** `100`

### Key Engineering Decisions
- **Guarded with `gs.isInteractive()`:** Ensures scheduled jobs, integrations, and background server scripts are not broken by user-session filtering.
- **Role Check (`!gs.hasRole('asset') && !gs.hasRole('admin')`):** Allows ITAM managers and admins unrestricted visibility while restricting end users to their own assigned assets.
- **Inherited Table Protection:** Placing the rule on parent table `alm_asset` enforces consistent filtering on child table `alm_hardware`.

## Verification (PDI Test)
1. Impersonated a standard demo user (`Abel Tuter`) lacking `asset` and `admin` roles and navigated to `alm_hardware.list`.
2. Observed that before enabling the Query rule, OOB Read ACLs removed 18 rows per page with a security constraints message; after enabling `LAB_Query_Restrict_Asset_Access`, only assets assigned to `Abel Tuter` were returned with no security constraints banner.
3. Deactivated the rule after verification to keep the PDI open for subsequent labs.
