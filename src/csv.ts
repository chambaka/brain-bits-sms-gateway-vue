/** Minimal CSV helper for portal imports. Supports quoted fields. */

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

export function phoneFromRow(row: CsvRow): string {
  return row.to || row.phone || row.msisdn || row.destination || "";
}

export function nameFromRow(row: CsvRow): string {
  return row.name || row.full_name || row.fullname || "";
}

export function variablesFromRow(row: CsvRow): Record<string, string> {
  const skip = new Set(["to", "phone", "msisdn", "destination", "name", "full_name", "fullname"]);
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!skip.has(key) && value) variables[key] = value;
  }
  if (nameFromRow(row) && !variables.name) {
    variables.name = nameFromRow(row);
  }
  return variables;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}
