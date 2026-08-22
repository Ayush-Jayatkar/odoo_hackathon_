'use client'

import { Bell, LogOut, Moon, Sun, CheckCircle, XCircle, UserPlus, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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

interface Notification {
    id: string
    message: string
    type: string
    read: boolean
    createdAt: string
}

export function TopBar({ user }: TopBarProps) {
    const { setTheme, theme } = useTheme()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    useEffect(() => {
        fetch('/api/notifications')
            .then((res) => res.json())
            .then((data) => {
                if (data.notifications) {
                    setNotifications(data.notifications)
                    setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
                }
            })
            .catch((err) => console.error('Failed to fetch notifications:', err))
    }, [])

    const handleNotificationsOpen = (open: boolean) => {
        setIsDropdownOpen(open)
        if (open && unreadCount > 0) {
            fetch('/api/notifications', { method: 'PATCH' })
                .then(() => {
                    setUnreadCount(0)
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                })
                .catch((err) => console.error('Failed to mark notifications read:', err))
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'LEAVE_APPROVED':
                return <CheckCircle className="w-4 h-4 text-[var(--meadow)]" />
            case 'LEAVE_REJECTED':
                return <XCircle className="w-4 h-4 text-[var(--rose)]" />
            case 'NEW_EMPLOYEE':
                return <UserPlus className="w-4 h-4 text-primary" />
            default:
                return <Info className="w-4 h-4 text-muted-foreground" />
        }
    }

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
                <DropdownMenu onOpenChange={handleNotificationsOpen}>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold text-white bg-[var(--rose)] rounded-full border-2 border-card">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    } />
                    <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto" align="end">
                        {/* plain div — DropdownMenuLabel needs Group context */}
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Notifications
                        </div>
                        <DropdownMenuSeparator />
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-transparent">
                                    <div className="flex items-center gap-2">
                                        {getNotificationIcon(notif.type)}
                                        <span className={`text-sm ${notif.read ? 'text-muted-foreground' : 'font-medium'}`}>
                                            {notif.message}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-6">
                                        {new Date(notif.createdAt).toLocaleString('en-IN')}
                                    </span>
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

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
                        {/* User info — must be inside DropdownMenuGroup for Label to work */}
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>

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
