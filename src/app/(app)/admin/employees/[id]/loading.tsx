import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="max-w-5xl space-y-6 animate-in fade-in duration-500">
            <Skeleton className="h-4 w-48" />
            <div className="bg-card rounded-xl p-4 flex gap-3 shadow-soft">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
            </div>
            <div className="flex gap-2 border-b pb-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-6 pt-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    )
}
