# DB Files

Active datastore workbook(s) for MVP live here.

## Current workbook
- `CRM_Datastore_Quickstart_v1.xlsx`

## Purpose
- This workbook is the source schema for the monolith app.
- It is designed for SharePoint-hosted usage in production.
- Local copy is used for development/testing before SharePoint wiring.

## Core tabs used by MVP app
- `Users`
- `Customers`
- `Bids`
- `BidTasks`
- `Projects`
- `ProjectPhases`
- `WorkOrders` (includes `InstallerUserId`)
- `Schedule`
- `Assignments`
- `Lookups`

## Important notes
- Keep headers stable; API routes depend on exact column names.
- Prefer adding new columns over renaming existing ones.
- Back up the workbook before structural edits.
