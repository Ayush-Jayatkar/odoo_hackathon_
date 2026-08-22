'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { FlowLine } from '@/components/ui/flow-line'

interface BottomTabBarProps {
    role: 'EMPLOYEE' | 'ADMIN'
}

export function BottomTabBar({ role }: BottomTabBarProps) {
    const pathname = usePathname()
    // For mobile, we show up to 5 items.
    const filteredNav = navItems.filter((item) => item.roles.includes(role)).slice(0, 5)

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 pb-safe z-50 shadow-[0_-4px_12px_rgba(20,23,43,0.04)]">
            {filteredNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'relative flex flex-col items-center justify-center w-full h-full space-y-1',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        {isActive && (
                            <div className="absolute top-0 left-1/4 right-1/4">
                                <FlowLine />
                            </div>
                        )}
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.title}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
