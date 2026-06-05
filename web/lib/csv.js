// Client-side CSV export of aggregated chart data (no raw DB dumps).

export function toCSV(rows) {
  if (!rows || !rows.length) return '';
  const cols = Array.from(rows.reduce((s, r) => {
    Object.keys(r || {}).forEach((k) => s.add(k));
    return s;
  }, new Set()));
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const head = cols.join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n');
  return head + '\n' + body;
}

export function downloadCSV(name, rows) {
  if (typeof document === 'undefined') return;
  const csv = toCSV(rows);
  if (!csv) return;
  // Prepend a UTF-8 BOM so Excel renders Chinese correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (name || 'data') + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Merge several aggregated arrays into one wide table keyed on a shared field
// (e.g. merge adoption + stringency rows by `year`). Generic — no assumptions
// about the inner column names.
export function mergeByKey(key, ...arrs) {
  const m = {};
  arrs.flat().forEach((r) => {
    if (r && r[key] != null) m[r[key]] = { ...(m[r[key]] || {}), ...r };
  });
  return Object.values(m).sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}
