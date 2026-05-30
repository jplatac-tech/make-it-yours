import { cn } from '../../lib/utils'

export function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        status === 'PENDIENTE' && 'bg-amber-100 text-amber-800',
        status === 'EN_REVISION' && 'bg-blue-100 text-blue-800',
        status === 'COTIZADO' && 'bg-violet-100 text-violet-800',
        status === 'APROBADO' && 'bg-emerald-100 text-emerald-800',
        status === 'RECHAZADO' && 'bg-red-100 text-red-800',
        status === 'NEW' && 'bg-slate-100 text-slate-800',
        status === 'REVIEWING' && 'bg-blue-100 text-blue-800',
        status === 'AWAITING_CORRECTION' && 'bg-amber-100 text-amber-900',
        status === 'READY_FOR_PRINT' && 'bg-emerald-100 text-emerald-900',
        status === 'IN_PRODUCTION' && 'bg-cyan-100 text-cyan-900',
        status === 'COMPLETED' && 'bg-emerald-200 text-emerald-950',
        status === 'CANCELLED' && 'bg-neutral-200 text-neutral-900',
      )}
    >
      {status}
    </span>
  )
}
