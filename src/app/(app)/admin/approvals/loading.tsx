import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function Loading() {
    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-serif font-bold animate-pulse text-muted-foreground/30">Loading...</h1>
            <TableSkeleton />
        </div>
    )
}
