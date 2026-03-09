const express = require("express");
const {
  readWorkbook,
  writeWorkbook,
  getSheetRows,
  replaceSheetRows,
  nowIso,
  nextId
} = require("./store");

function createApi() {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, at: nowIso() });
  });

  router.get("/bids", (_req, res) => {
    const wb = readWorkbook();
    const bids = getSheetRows(wb, "Bids");
    res.json(bids);
  });

  router.post("/bids", (req, res) => {
    const wb = readWorkbook();
    const bids = getSheetRows(wb, "Bids");
    const bidId = nextId("BID-LOCAL-", bids, "BidId");
    const bidNumber = `LOCAL-${Date.now()}`;
    const bid = {
      BidId: bidId,
      BidNumber: bidNumber,
      CustomerId: req.body.CustomerId || "",
      BidTitle: req.body.BidTitle || "New Bid",
      BidOwnerUserId: req.body.BidOwnerUserId || "",
      EstimatorUserId: req.body.EstimatorUserId || "",
      BidStatus: "draft",
      RequestReceivedDate: req.body.RequestReceivedDate || nowIso().slice(0, 10),
      DueDate: req.body.DueDate || "",
      SubmittedDate: "",
      ApprovedDate: "",
      TotalEstimatedAmount: req.body.TotalEstimatedAmount || "",
      Notes: req.body.Notes || ""
    };
    bids.push(bid);
    replaceSheetRows(wb, "Bids", bids);
    writeWorkbook(wb);
    res.status(201).json(bid);
  });

  router.post("/bids/:bidId/assign", (req, res) => {
    const wb = readWorkbook();
    const tasks = getSheetRows(wb, "Assignments");
    const taskId = nextId("ASG-", tasks, "AssignmentId");
    const task = {
      AssignmentId: taskId,
      EntityType: "bid",
      EntityId: req.params.bidId,
      TaskTitle: req.body.TaskTitle || "Complete bid and submit",
      AssignedUserId: req.body.AssignedUserId || "",
      AssignedRole: req.body.AssignedRole || "estimator",
      TaskStatus: "assigned",
      AssignedAtUtc: nowIso(),
      DueDate: req.body.DueDate || "",
      CompletedAtUtc: "",
      CompletionEffect: "Set BidStatus=submitted",
      Priority: req.body.Priority || "medium",
      Notes: req.body.Notes || ""
    };
    tasks.push(task);
    replaceSheetRows(wb, "Assignments", tasks);
    writeWorkbook(wb);
    res.status(201).json(task);
  });

  router.post("/bids/:bidId/submit", (req, res) => {
    const wb = readWorkbook();
    const bids = getSheetRows(wb, "Bids");
    const bid = bids.find((b) => b.BidId === req.params.bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });
    bid.BidStatus = "submitted";
    bid.SubmittedDate = nowIso().slice(0, 10);
    replaceSheetRows(wb, "Bids", bids);
    writeWorkbook(wb);
    res.json(bid);
  });

  router.post("/bids/:bidId/convert-to-project", (req, res) => {
    const wb = readWorkbook();
    const bids = getSheetRows(wb, "Bids");
    const projects = getSheetRows(wb, "Projects");
    const phases = getSheetRows(wb, "ProjectPhases");
    const bid = bids.find((b) => b.BidId === req.params.bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    const projectId = nextId("PRJ-LOCAL-", projects, "ProjectId");
    const project = {
      ProjectId: projectId,
      ProjectNumber: `LOCAL-${Date.now()}`,
      BidId: bid.BidId,
      CustomerId: bid.CustomerId,
      ProjectName: bid.BidTitle || "Converted Project",
      ProjectStatus: "active",
      StartDate: req.body.StartDate || nowIso().slice(0, 10),
      TargetCompletionDate: req.body.TargetCompletionDate || "",
      ProjectManagerUserId: req.body.ProjectManagerUserId || bid.BidOwnerUserId || "",
      Notes: "Converted from bid"
    };
    projects.push(project);

    const defaults = ["rough", "trim", "startup", "warranty"];
    defaults.forEach((phaseCode, idx) => {
      phases.push({
        ProjectPhaseId: nextId("PP-", phases, "ProjectPhaseId"),
        ProjectId: projectId,
        PhaseCode: phaseCode,
        SequenceNo: idx + 1,
        PhaseStatus: idx === 0 ? "in_progress" : "not_started",
        StartDate: idx === 0 ? project.StartDate : "",
        TargetDate: "",
        CompletedDate: "",
        BlockedReason: ""
      });
    });

    bid.BidStatus = "approved";
    bid.ApprovedDate = nowIso().slice(0, 10);

    replaceSheetRows(wb, "Bids", bids);
    replaceSheetRows(wb, "Projects", projects);
    replaceSheetRows(wb, "ProjectPhases", phases);
    writeWorkbook(wb);
    res.status(201).json({ project, phases: phases.filter((p) => p.ProjectId === projectId) });
  });

  router.get("/projects", (_req, res) => {
    const wb = readWorkbook();
    res.json(getSheetRows(wb, "Projects"));
  });

  router.get("/work-orders", (req, res) => {
    const wb = readWorkbook();
    let rows = getSheetRows(wb, "WorkOrders");
    if (req.query.projectId) {
      rows = rows.filter((r) => r.ProjectId === req.query.projectId);
    }
    res.json(rows);
  });

  router.post("/work-orders", (req, res) => {
    const wb = readWorkbook();
    const rows = getSheetRows(wb, "WorkOrders");
    const wo = {
      WorkOrderId: nextId("WO-", rows, "WorkOrderId"),
      ProjectId: req.body.ProjectId || "",
      ProjectPhaseId: req.body.ProjectPhaseId || "",
      WorkOrderType: req.body.WorkOrderType || "standard",
      Title: req.body.Title || "New Work Order",
      AssignedUserId: req.body.AssignedUserId || "",
      InstallerUserId: req.body.InstallerUserId || req.body.AssignedUserId || "",
      WorkOrderStatus: "open",
      ScheduledStart: req.body.ScheduledStart || "",
      ScheduledEnd: req.body.ScheduledEnd || "",
      ActualStart: "",
      ActualEnd: "",
      InspectionStatus: "pending",
      InvoiceStatus: "pending",
      Notes: req.body.Notes || ""
    };
    rows.push(wo);
    replaceSheetRows(wb, "WorkOrders", rows);
    writeWorkbook(wb);
    res.status(201).json(wo);
  });

  router.post("/work-orders/:workOrderId/assign", (req, res) => {
    const wb = readWorkbook();
    const workOrders = getSheetRows(wb, "WorkOrders");
    const assignments = getSheetRows(wb, "Assignments");
    const wo = workOrders.find((w) => w.WorkOrderId === req.params.workOrderId);
    if (!wo) return res.status(404).json({ error: "Work order not found" });

    wo.AssignedUserId = req.body.AssignedUserId || wo.AssignedUserId;
    wo.InstallerUserId = req.body.InstallerUserId || wo.InstallerUserId || wo.AssignedUserId;
    wo.WorkOrderStatus = "assigned";

    assignments.push({
      AssignmentId: nextId("ASG-", assignments, "AssignmentId"),
      EntityType: "work_order",
      EntityId: wo.WorkOrderId,
      TaskTitle: req.body.TaskTitle || wo.Title || "Execute work order",
      AssignedUserId: wo.AssignedUserId,
      AssignedRole: "installer",
      TaskStatus: "assigned",
      AssignedAtUtc: nowIso(),
      DueDate: req.body.DueDate || "",
      CompletedAtUtc: "",
      CompletionEffect: "Set WorkOrderStatus=complete",
      Priority: req.body.Priority || "high",
      Notes: req.body.Notes || ""
    });

    replaceSheetRows(wb, "WorkOrders", workOrders);
    replaceSheetRows(wb, "Assignments", assignments);
    writeWorkbook(wb);
    res.json(wo);
  });

  router.post("/work-orders/:workOrderId/complete", (req, res) => {
    const wb = readWorkbook();
    const workOrders = getSheetRows(wb, "WorkOrders");
    const wo = workOrders.find((w) => w.WorkOrderId === req.params.workOrderId);
    if (!wo) return res.status(404).json({ error: "Work order not found" });
    wo.WorkOrderStatus = "complete";
    wo.ActualEnd = nowIso();
    wo.InvoiceStatus = "pending";
    replaceSheetRows(wb, "WorkOrders", workOrders);
    writeWorkbook(wb);
    res.json(wo);
  });

  router.post("/assignments/:assignmentId/complete", (req, res) => {
    const wb = readWorkbook();
    const assignments = getSheetRows(wb, "Assignments");
    const bids = getSheetRows(wb, "Bids");
    const workOrders = getSheetRows(wb, "WorkOrders");
    const a = assignments.find((x) => x.AssignmentId === req.params.assignmentId);
    if (!a) return res.status(404).json({ error: "Assignment not found" });
    a.TaskStatus = "done";
    a.CompletedAtUtc = nowIso();

    if (a.EntityType === "bid") {
      const b = bids.find((x) => x.BidId === a.EntityId);
      if (b && b.BidStatus !== "approved") {
        b.BidStatus = "submitted";
        b.SubmittedDate = nowIso().slice(0, 10);
      }
      replaceSheetRows(wb, "Bids", bids);
    }
    if (a.EntityType === "work_order") {
      const w = workOrders.find((x) => x.WorkOrderId === a.EntityId);
      if (w) {
        w.WorkOrderStatus = "complete";
        w.ActualEnd = nowIso();
      }
      replaceSheetRows(wb, "WorkOrders", workOrders);
    }

    replaceSheetRows(wb, "Assignments", assignments);
    writeWorkbook(wb);
    res.json(a);
  });

  router.get("/my-tasks", (req, res) => {
    const wb = readWorkbook();
    const assignments = getSheetRows(wb, "Assignments");
    const userId = req.query.userId;
    const rows = userId
      ? assignments.filter((a) => a.AssignedUserId === userId && a.TaskStatus !== "done")
      : assignments.filter((a) => a.TaskStatus !== "done");
    res.json(rows);
  });

  router.post("/schedule", (req, res) => {
    const wb = readWorkbook();
    const rows = getSheetRows(wb, "Schedule");
    const row = {
      ScheduleId: nextId("SCH-", rows, "ScheduleId"),
      ProjectId: req.body.ProjectId || "",
      WorkOrderId: req.body.WorkOrderId || "",
      AssignedUserId: req.body.AssignedUserId || "",
      ScheduleDate: req.body.ScheduleDate || "",
      StartTime: req.body.StartTime || "",
      EndTime: req.body.EndTime || "",
      ScheduleStatus: req.body.ScheduleStatus || "scheduled",
      Notes: req.body.Notes || ""
    };
    rows.push(row);
    replaceSheetRows(wb, "Schedule", rows);
    writeWorkbook(wb);
    res.status(201).json(row);
  });

  return router;
}

module.exports = { createApi };
