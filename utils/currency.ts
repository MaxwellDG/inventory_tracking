export function formatCurrency(value: number | string): string {
  return parseFloat(String(value)).toFixed(2);
}
