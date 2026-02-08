// Convert Date to YYYYMMDD format (bigint)
export function parseDateFromInput(dateString: string): bigint {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return BigInt(`${year}${month}${day}`);
}

// Convert Date to YYYY-MM-DD format for input
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert YYYYMMDD bigint to display format
export function formatDateForDisplay(dateNum: bigint): string {
  const dateStr = dateNum.toString();
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${day}/${month}/${year}`;
}

// Filter entries by date range
export function filterByDateRange<T extends { date: bigint }>(
  entries: T[],
  startDate: string,
  endDate: string
): T[] {
  if (!startDate && !endDate) return entries;
  
  const start = startDate ? parseDateFromInput(startDate) : null;
  const end = endDate ? parseDateFromInput(endDate) : null;
  
  return entries.filter((entry) => {
    if (start && entry.date < start) return false;
    if (end && entry.date > end) return false;
    return true;
  });
}
