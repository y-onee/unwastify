export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const s = String(dateStr);
  
  // Handle specific backend YYYYMMDD format
  if (/^\d{8}$/.test(s)) {
    const year = s.slice(0, 4);
    const month = parseInt(s.slice(4, 6), 10) - 1; // 0-indexed months
    const day = s.slice(6, 8);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  
  // Try generic date parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
     return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return s; // Fallback
}

export function getNextMonday() {
  const d = new Date();
  const day = d.getDay();
  // if today is Monday (1), still get *next* Monday? The standard behavior typically gets the upcoming Monday
  // Days until next Monday: (1 - day + 7) % 7. If it's 0 (today is Monday), we add 7 days to get NEXT Monday.
  const daysUntilMonday = (1 - day + 7) % 7 || 7; 
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
