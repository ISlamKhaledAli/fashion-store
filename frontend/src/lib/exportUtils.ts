/**
 * Client-side CSV export utility.
 * Formats objects into RFC 4180 compliant CSV and triggers browser download.
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columnOrder?: string[]
): void {
  if (!data || data.length === 0) {
    throw new Error("No data available to export");
  }

  // Determine headers
  const headers =
    columnOrder && columnOrder.length > 0
      ? columnOrder
      : Array.from(
          new Set(
            data.reduce<string[]>(
              (acc, row) => acc.concat(Object.keys(row)),
              []
            )
          )
        );

  const escapeCSVValue = (val: unknown): string => {
    if (val === null || val === undefined) {
      return "";
    }
    if (typeof val === "object") {
      if (val instanceof Date) {
        return val.toISOString();
      }
      return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
    }
    const str = String(val);
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(escapeCSVValue).join(","));

  // Data rows
  for (const row of data) {
    const rowValues = headers.map((header) => escapeCSVValue(row[header]));
    csvRows.push(rowValues.join(","));
  }

  const csvContent = "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
