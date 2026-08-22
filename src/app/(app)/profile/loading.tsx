import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-serif font-bold animate-pulse text-muted-foreground/30">Loading...</h1>
            <div className="bg-card rounded-2xl p-8 flex items-center gap-6 shadow-soft">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
}
