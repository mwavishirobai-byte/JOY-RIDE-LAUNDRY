import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKES(amount: number): string {
  return `KES ${Number(amount || 0).toLocaleString('en-KE')}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getStatusBadgeInfo(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'requested':
      return { label: 'Requested', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'confirmed':
      return { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'pickup_scheduled':
      return { label: 'Pickup Scheduled', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'picked_up':
      return { label: 'Picked Up', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'processing':
    case 'washing':
    case 'drying':
    case 'ironing_folding':
    case 'quality_check':
      return {
        label: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      };
    case 'ready':
      return { label: 'Ready for Delivery', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'delivered':
    case 'completed':
      return { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
