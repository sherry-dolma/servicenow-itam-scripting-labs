# Stockroom Governance — Before Business Rule (`alm_hardware`)

## Business Problem
In enterprise ITAM operations, hardware assets returned to `In stock (Available)` without a linked Stockroom—or still assigned to a departing employee—corrupt inventory accuracy and CMDB reporting. Client Scripts and UI Policies only protect form views and are bypassed during List edits, Import Sets, and API updates.

## Solution Architecture
Implemented a server-side **Before Insert/Update Business Rule** on `alm_hardware` to enforce data governance across all entry points (Forms, List edits, and server-side scripts/APIs).

### Configuration
- **Name:** `LAB_Before_Hardware_Stockroom_Check`
- **Table:** Hardware (`alm_hardware`)
- **When:** `before` (Insert & Update) | **Order:** `100`
- **Condition:** `State` is `In stock` AND `Substate` is `available`

### Key Design Decisions
- Used `current.setAbortAction(true)` with `gs.addErrorMessage()` to block invalid database writes when `stockroom` is empty.
- Used `current.setValue('assigned_to', '')` to clear stale custodian assignments without calling `current.update()` (preventing double saves and recursive update loops).

## Verification (3 Entry Points Tested in PDI)
1. **Form Test:** Confirmed save aborts with policy error when `stockroom` is blank; confirmed `assigned_to` clears automatically once a valid Stockroom is selected.
2. **List Edit Test:** Confirmed inline list edits on `alm_hardware.list` are blocked by the server-side rule.
3. **Background Script Test:** Simulated API/script update via `GlideRecord` (`install_status = '6'`, `substatus = 'available'`, blank `stockroom`) and verified `gr.update()` returned `null` (aborted).
