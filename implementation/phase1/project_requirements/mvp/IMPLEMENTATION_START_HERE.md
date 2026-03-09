# MVP Start Here

This is the active scope for implementation/refinement.

## Primary files
- Datastore workbook: `../../db_files/CRM_Datastore_Quickstart_v1.xlsx`
- Azure simple stack: `azure_simple_mvp_stack.md`
- Feature scope/phases: `feature_phases.md`
- Base schema: `spreadsheet_schema.md`
- Workbook alignment notes: `workbook_field_alignment.md`

## Current MVP flow
1. Create Customer
2. Create Bid
3. Assign Bid task
4. Mark Bid assignment complete -> Bid submitted/approved
5. Convert Bid to Project
6. Create/track Project phases
7. Create/assign Work Orders (Installer)
8. Mark Work Order assignment complete
9. Schedule Work Orders

## Scope guardrails
- Keep stack simple: single frontend + lightweight Azure API + SharePoint Excel datastore.
- Prefer iterative schema updates over premature architecture complexity.
- Treat all non-MVP asks as backlog unless needed to unblock this flow.
