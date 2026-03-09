# Azure Simple MVP Stack (App Script Style, M365 Native)

Goal: keep architecture as simple as possible for a 5-6 person team and low daily volume.

## Recommended Simple Stack
- **Frontend**: single-page HTML + vanilla JS (App Script style UX).
- **Backend API**: one lightweight Azure Function App (HTTP endpoints).
- **Auth**: Microsoft Entra ID (M365 sign-in only).
- **Datastore**: SharePoint-hosted Excel workbook (`implementation/phase1/db_files/CRM_Datastore_Quickstart_v1.xlsx`).
- **Files**: SharePoint/OneDrive links.

## Why this fits your context
- Minimal services to run and maintain.
- Familiar M365 ecosystem and user identities.
- Easy to iterate data model while requirements evolve.
- Avoids early over-engineering.

## Core endpoints to build first
- `POST /bids`
- `POST /bids/{id}/assign`
- `POST /bids/{id}/submit`
- `POST /bids/{id}/convert-to-project`
- `POST /work-orders`
- `POST /work-orders/{id}/assign`
- `POST /work-orders/{id}/complete`
- `POST /schedule`
- `GET /my-tasks`

## Assignment -> Completion flow (must-have)
- Any assignment (Bid/Project/WorkOrder) creates a row in `Assignments`.
- Assignee sees task in `GET /my-tasks`.
- Marking assignment `done` triggers entity status update:
  - bid task done + submitted action -> `Bids.BidStatus=submitted`
  - work order assignment done -> `WorkOrders.WorkOrderStatus=complete`
- Keep this mapping in one server-side rules module.
