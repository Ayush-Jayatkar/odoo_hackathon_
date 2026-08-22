import { cn } from '@/lib/utils'

interface FlowLineProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

export function FlowLine({ className, ...props }: FlowLineProps) {
    return (
        <div
            className={cn(
                'h-[2px] w-full rounded-full bg-gradient-to-r from-[var(--dawn)] via-[var(--midday)] to-[var(--dusk)]',
                className
            )}
            {...props}
        />
    )
}
