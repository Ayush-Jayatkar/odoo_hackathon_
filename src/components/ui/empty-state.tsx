import { Inbox } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ElementType
}

export function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
            )}
        </div>
    )
}
