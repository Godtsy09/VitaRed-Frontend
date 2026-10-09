export function getInitials(nombre?: string | null, apellido?: string | null): string {
  const first = (nombre ?? '').trim();
  const last = (apellido ?? '').trim();

  const firstInitial = first.charAt(0);

  let secondInitial = last.charAt(0);
  if (!secondInitial && first) {
    const parts = first.split(/\s+/).filter(Boolean);
    secondInitial = parts.length > 1 ? parts[1].charAt(0) : first.charAt(1);
  }

  return `${firstInitial}${secondInitial}`.toUpperCase();
}
