# X Mechanicals MVP Monolith

Simple KISS scaffold:
- single deployable app
- static HTML + vanilla JS
- server-side API routes in same app
- Excel workbook datastore (`../db_files/CRM_Datastore_Quickstart_v1.xlsx`)

## Assumptions
- Customer, client contact, and installer records already exist in datastore tabs.
- M365 auth integration comes next; this scaffold focuses on workflow and data shape.

## Run locally
```bash
cd implementation/phase1/monolith
npm install
npm run dev
```

Open `http://localhost:3000`.

## Implemented API (starter)
- `GET /api/health`
- `GET /api/bids`
- `POST /api/bids`
- `POST /api/bids/:bidId/assign`
- `POST /api/bids/:bidId/submit`
- `POST /api/bids/:bidId/convert-to-project`
- `GET /api/projects`
- `GET /api/work-orders`
- `POST /api/work-orders`
- `POST /api/work-orders/:workOrderId/assign`
- `POST /api/work-orders/:workOrderId/complete`
- `POST /api/assignments/:assignmentId/complete`
- `GET /api/my-tasks`
- `POST /api/schedule`

## Next immediate step
- Add Entra ID auth middleware and map authenticated user email -> `Users.UserId`.
