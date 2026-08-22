import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold animate-pulse text-muted-foreground/30">Loading...</h1>
                <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[350px] lg:col-span-2 rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
        </div>
    )
}
