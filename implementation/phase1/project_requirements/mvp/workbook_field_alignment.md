# Workbook-to-CRM Field Alignment

This maps `Bird Dog Group - 2440 Bertania Cir  Ebert  HVAC Mark Up Summary Sheet.xlsx` to the CRM spreadsheet datastore so we preserve existing operational logic.

## 1) High-Value Parallels Found

## Workbook tab: `Builder Info Sheet`
Best match in CRM:
- `Customers`
- `Contacts`
- `Bids` (job intake metadata)

Field alignment:
- `Builder` -> `Customers.DisplayName` (or `CustomerType=builder`)
- `Customer Name` -> `Contacts` (primary contact)
- `Email` / `Billing Email` -> `Contacts.Email` / `Customers.BillingEmail` (add field)
- `Address`, `City/St`, `County` -> `Customers` address fields
- `Lot`, `Subdivision` -> `Bids.Lot`, `Bids.Subdivision` (add fields)
- `Qty of Systems`, `Brand`, `Electric/Gas`, `Zoning` -> `Bids` scope fields (add custom columns)

## Workbook tabs: `Rough Labor`, `Trim Labor`, `Gas PIpe`
Best match in CRM:
- `BidLineItems`
- `WorkOrderTasks` templates by phase

Field alignment:
- `Qty` -> `BidLineItems.Quantity`
- `$/Ea` -> `BidLineItems.UnitPrice`
- `Item` -> `BidLineItems.ItemDescription`
- `Exten` -> `BidLineItems.LineAmount`
- Tab name -> `BidLineItems.PhaseHint` + `Category`

Recommended `PhaseHint` values:
- `Rough Labor` -> `rough`
- `Trim Labor` -> `trim`
- `Gas PIpe` -> `rough` (or `gas` category + rough phase default)

## Workbook tab: `Materials` (and `Sheet1`, `Sheet2`, `Sheet9`)
Best match in CRM:
- `ItemCatalog` (new lookup tab)
- `BidLineItems` (when selected into a bid)

Field alignment:
- `Part No` / `AccountingCode1` -> `ItemCatalog.ItemCode`
- `Description` / `ItemDescription` -> `ItemCatalog.ItemDescription`
- `UM` / `UnitOfMeasure` -> `ItemCatalog.Unit`
- `Net Price` -> `ItemCatalog.StandardCost`
- `FolderLevel*` / category blocks -> `ItemCatalog.CategoryPath`

## Workbook tab: `Summary`
Best match in CRM:
- `Bids` (estimate totals)
- `Projects` (converted value baseline)
- `ProjectFinancialSnapshot` (new table for cost rollups)

Field alignment examples:
- `Job Selling Price` -> `Bids.TotalEstimatedAmount`
- `Qty of Systems`, `Total Ton` -> `Bids.ScopeSummary` fields
- `Total Labor Cost` / `Total Material Cost` / `Total Direct Cost` -> `ProjectFinancialSnapshot`
- overhead/warranty percentages -> pricing policy lookup table

## Workbook tab: `Extras`
Best match in CRM:
- `OptionCatalog` (new lookup tab)
- `BidLineItems` (selected options)

Field alignment:
- `Item` -> `OptionCatalog.OptionName`
- `Cost/Ea` -> `OptionCatalog.UnitPrice`
- `UoM` -> `OptionCatalog.Unit`

## Workbook tab: `Time Card`
Best match in CRM:
- `LaborEntries` (new operational table)
- optional rollup into `WorkOrders`

Field alignment:
- `Employee Name`, `Reg Hours`, `Piece Rate Hours`, `Job Number`, `LOT`, `SUBDIVISION/ADDRESS`
  -> `LaborEntries`

## Workbook tab: `On Call`
Best match in CRM:
- `ServiceRateCatalog` (new lookup table)

---

## 2) CRM Schema Adjustments Recommended

Your current schema is strong, but add these tabs to preserve workbook detail without overloading core entities:

- `ItemCatalog`
  - `ItemCode`, `ItemDescription`, `Unit`, `StandardCost`, `Category`, `PhaseDefault`, `IsActive`
- `OptionCatalog`
  - `OptionCode`, `OptionName`, `Unit`, `UnitPrice`, `Category`, `IsActive`
- `WorkOrderTaskTemplates`
  - `TemplateCode`, `PhaseCode`, `TaskName`, `TaskType`, `DefaultAssigneeRole`, `SortOrder`
- `ProjectFinancialSnapshot`
  - `ProjectId`, `EstimateLabor`, `EstimateMaterial`, `EstimateDirectCost`, `OverheadPct`, `MarginPct`, `SellingPrice`
- `LaborEntries`
  - `LaborEntryId`, `WorkOrderId`, `UserId`, `WorkDate`, `RegularHours`, `PieceRateHours`, `Notes`

---

## 3) Starter "Spreadsheet DB" Tabs for Sprint 1

Use this tab set first:

1. `Customers`
2. `Contacts`
3. `Users`
4. `Bids`
5. `BidLineItems`
6. `Projects`
7. `ProjectPhases`
8. `WorkOrders`
9. `WorkOrderTasks`
10. `Invoices`
11. `ItemCatalog`
12. `OptionCatalog`
13. `WorkOrderTaskTemplates`
14. `ActivityLog`
15. `Lookups`

This gives you immediate bid/project/work-order flow plus workbook compatibility.

---

## 4) Phase Template Defaults (from discussion + workbook)

Default phases:
1. `rough`
2. `trim`
3. `startup`
4. `warranty`

Default rough task examples:
- Order materials
- Order equipment
- Order prefabrication
- Confirm site readiness
- Schedule crew

Default trim task examples:
- Install finish components
- Capture required photo checklist
- Request/track inspection

Startup/warranty examples:
- Commissioning checklist
- Punch-list closure
- Warranty ticket linkage

---

## 5) Practical Import Strategy

1. Import workbook line libraries into `ItemCatalog` and `OptionCatalog`.
2. Keep `BidLineItems` transactional (project-specific).
3. When bid converts to project:
   - create `ProjectPhases`
   - seed `WorkOrders`
   - seed `WorkOrderTasks` from `WorkOrderTaskTemplates`.
4. Enforce strict gate already confirmed:
   - next phase blocked until prior phase work-order invoices are `paid`.
