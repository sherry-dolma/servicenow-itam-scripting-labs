# Async Stockroom Inventory Value Rollup — Async Business Rule + GlideAggregate (`alm_hardware`)

## Business Problem
Recalculating total inventory dollar value across an entire Stockroom synchronously every time a hardware asset's Cost, Stockroom, or State changes degrades form-save performance for ITAM staff—especially as asset tables scale into thousands of records.

## Solution Architecture
Implemented an **Async Insert/Update Business Rule** on `alm_hardware` that queues a background scheduled job (`sys_trigger`) and aggregates stockroom totals directly in the database using `GlideAggregate`.

### Configuration
- **Name:** `LAB_Async_Stockroom_Inventory_Value`
- **Table:** Hardware (`alm_hardware`)
- **When:** `async` (Insert & Update) | **Order:** `100`
- **Condition:** `Stockroom` is not empty AND (`Cost` changes OR `State` changes OR `Stockroom` changes)

### Key Engineering Decisions
- **Condition Evaluation vs. Async Script Body:** Placed `.changes()` checks inside the Business Rule Filter Conditions (which evaluate *before* the async job is queued), because `previous` is `null` inside an Async script body.
- **Database Aggregation (`GlideAggregate`):** Used `ga.setGroup(false)` with `SUM('cost')` and `COUNT` filtered to `install_status = '6'` (`In stock`) instead of looping through `GlideRecord` rows in memory.
- **No `current.update()`:** Logged the rollup asynchronously without modifying `current`, preventing unnecessary database writes or recursive triggers.

## Verification (PDI Demo Data Results)
Tested updates on `In stock` (`6`) hardware assets in the PDI and verified asynchronous execution in **System Logs > System Log > All**:
- **San Francisco Warehouse:** Initial update logged `2 In-Stock hardware assets totaling $6500.9900`; increasing an asset's cost by `$500` updated the async log 30 seconds later to `$7000.9900`.
- **Santa Monica Warehouse:** Updating an asset logged `1 In-Stock hardware assets totaling $5000.0000`.
