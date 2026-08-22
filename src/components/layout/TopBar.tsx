'use client'

import { Bell, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TopBarProps {
    user: {
        name: string
        email: string
        role: string
    }
}

export function TopBar({ user }: TopBarProps) {
    const { setTheme, theme } = useTheme()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            toast.success('Logged out successfully')
            router.push('/login')
            router.refresh()
        } catch {
            toast.error('Failed to log out')
        }
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

    return (
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Greeting (desktop) / Wordmark (mobile) */}
            <div>
                <h2 className="text-xl font-serif hidden md:block">
                    Good morning, <span className="text-primary">{user.name.split(' ')[0]}</span>
                </h2>
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flow-line" />
                    <span className="font-serif font-bold">Dayflow</span>
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--rose)]" />
                </Button>

                {/* Avatar dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none rounded-full">
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end">
                        {/* User info */}
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {/* Theme toggle */}
                        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? (
                                <Sun className="mr-2 h-4 w-4" />
                            ) : (
                                <Moon className="mr-2 h-4 w-4" />
                            )}
                            <span>Toggle theme</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Logout */}
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-[var(--rose)] focus:text-[var(--rose)] focus:bg-[var(--rose)]/10"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
