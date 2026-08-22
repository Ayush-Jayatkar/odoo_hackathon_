'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { FlowLine } from '@/components/ui/flow-line'

interface SidebarProps {
    role: 'EMPLOYEE' | 'ADMIN'
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname()
    const filteredNav = navItems.filter((item) => item.roles.includes(role))

    return (
        <aside className="hidden md:flex flex-col w-64 bg-card border-r min-h-screen">
            <div className="p-6 flex items-center space-x-3">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full flow-line" />
                </div>
                <span className="text-2xl font-serif font-bold text-foreground">Dayflow</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex items-center space-x-3 px-4 py-3 rounded-md transition-colors',
                                isActive
                                    ? 'text-primary bg-primary/5 font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                            {isActive && (
                                <div className="absolute bottom-0 left-4 right-4">
                                    <FlowLine />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
