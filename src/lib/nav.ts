import { LayoutDashboard, CalendarCheck, CalendarOff, Banknote, User, Users, CheckSquare, Home, BarChart3 } from 'lucide-react'

export type NavItem = {
    title: string
    href: string
    icon: React.ElementType
    roles: ('EMPLOYEE' | 'ADMIN')[]
}

export const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['EMPLOYEE'],
    },
    {
        title: 'Admin Home',
        href: '/admin',
        icon: Home,
        roles: ['ADMIN'],
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarCheck,
        roles: ['EMPLOYEE', 'ADMIN'],
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: CalendarOff,
        roles: ['EMPLOYEE', 'ADMIN'],
    },
    {
        title: 'Payroll',
        href: '/payroll',
        icon: Banknote,
        roles: ['EMPLOYEE', 'ADMIN'],
    },
    {
        title: 'Employees',
        href: '/admin/employees',
        icon: Users,
        roles: ['ADMIN'],
    },
    {
        title: 'Approvals',
        href: '/admin/approvals',
        icon: CheckSquare,
        roles: ['ADMIN'],
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        roles: ['ADMIN'],
    },
    {
        title: 'Profile',
        href: '/profile',
        icon: User,
        roles: ['EMPLOYEE', 'ADMIN'],
    },
]
