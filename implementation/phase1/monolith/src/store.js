const path = require("path");
const XLSX = require("xlsx");

const DB_PATH =
  process.env.DB_PATH ||
  path.resolve(__dirname, "../../db_files/CRM_Datastore_Quickstart_v1.xlsx");

function readWorkbook() {
  return XLSX.readFile(DB_PATH);
}

function writeWorkbook(wb) {
  XLSX.writeFile(wb, DB_PATH);
}

function getSheetRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

function replaceSheetRows(wb, sheetName, rows) {
  const ws = wb.Sheets[sheetName];
  const currentRows = ws ? XLSX.utils.sheet_to_json(ws, { defval: "" }) : [];
  const headers = currentRows.length
    ? Object.keys(currentRows[0])
    : rows.length
      ? Object.keys(rows[0])
      : [];
  const normalized = rows.map((r) => {
    const obj = {};
    headers.forEach((h) => {
      obj[h] = r[h] ?? "";
    });
    return obj;
  });
  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(normalized, { header: headers });
}

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix, rows, key) {
  const nums = rows
    .map((r) => String(r[key] || ""))
    .map((v) => v.match(/(\d+)$/))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

module.exports = {
  DB_PATH,
  readWorkbook,
  writeWorkbook,
  getSheetRows,
  replaceSheetRows,
  nowIso,
  nextId
};
