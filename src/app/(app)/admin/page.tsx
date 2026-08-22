import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { FlowLine } from '@/components/ui/flow-line'
import { Users, CalendarCheck, CalendarOff, Building2, ChevronRight, Clock, CheckSquare, Banknote, BarChart3 } from 'lucide-react'

async function getAdminDashboardData() {
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))

    const [totalEmployees, presentToday, pendingLeaves, profiles] = await Promise.all([
        prisma.user.count({ where: { role: 'EMPLOYEE' } }),
        prisma.attendance.count({
            where: {
                date: { gte: todayUTC, lt: tomorrowUTC },
                status: 'PRESENT',
            },
        }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.profile.findMany({ select: { department: true } }),
    ])

    const departmentCount = new Set(
        profiles.map((p) => p.department).filter(Boolean)
    ).size

    return { totalEmployees, presentToday, pendingLeaves, departmentCount }
}

export default async function AdminHomePage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const data = await getAdminDashboardData()
    const firstName = session.name.split(' ')[0]

    const hour = new Date().getUTCHours() + 5.5
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const stats = [
        {
            label: 'Total Employees',
            value: data.totalEmployees,
            icon: Users,
            color: 'var(--midday)',
            bg: 'color-mix(in srgb, var(--midday) 12%, transparent)',
            href: '/admin/employees',
        },
        {
            label: 'Present Today',
            value: data.presentToday,
            icon: CalendarCheck,
            color: 'var(--meadow)',
            bg: 'color-mix(in srgb, var(--meadow) 12%, transparent)',
            href: '/admin/attendance',
        },
        {
            label: 'Pending Leave',
            value: data.pendingLeaves,
            icon: CalendarOff,
            color: 'var(--dawn)',
            bg: 'color-mix(in srgb, var(--dawn) 12%, transparent)',
            href: '/admin/approvals',
        },
        {
            label: 'Departments',
            value: data.departmentCount,
            icon: Building2,
            color: 'var(--dusk)',
            bg: 'color-mix(in srgb, var(--dusk) 12%, transparent)',
            href: '/admin/employees',
        },
    ]

    const quickPanels = [
        {
            title: 'Attendance Overview',
            desc: 'View and monitor daily attendance records across all employees and departments.',
            href: '/admin/attendance',
            icon: Clock,
            color: 'var(--meadow)',
            bg: 'color-mix(in srgb, var(--meadow) 10%, transparent)',
        },
        {
            title: 'Leave Approvals',
            desc: 'Review, approve, or reject pending employee leave requests.',
            href: '/admin/approvals',
            icon: CheckSquare,
            color: 'var(--dawn)',
            bg: 'color-mix(in srgb, var(--dawn) 10%, transparent)',
        },
        {
            title: 'Payroll Management',
            desc: 'Manage salaries, allowances, and deductions. Download payslips.',
            href: '/admin/payroll',
            icon: Banknote,
            color: 'var(--dusk)',
            bg: 'color-mix(in srgb, var(--dusk) 10%, transparent)',
        },
        {
            title: 'Analytics & Insights',
            desc: 'View live visual reports on attendance, leave, and department metrics.',
            href: '/admin/analytics',
            icon: BarChart3,
            color: 'var(--midday)',
            bg: 'color-mix(in srgb, var(--midday) 10%, transparent)',
        },
    ]

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Hero */}
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <FlowLine />
                <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-1">{greeting}, Admin</p>
                    <h1 className="text-3xl font-serif font-bold text-foreground">{firstName} 👋</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Here&apos;s a live snapshot of your organisation right now.
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="group card-hover bg-card rounded-xl shadow-soft p-5 flex flex-col gap-4"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: stat.bg }}
                            >
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <div>
                                <p
                                    className="text-4xl font-mono font-bold leading-none"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1.5">{stat.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick-access panels */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickPanels.map((panel) => (
                        <Link
                            key={panel.href}
                            href={panel.href}
                            className="group card-hover bg-card rounded-xl shadow-soft p-6 flex flex-col gap-4 border border-transparent hover:border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: panel.bg }}
                                >
                                    <panel.icon className="w-5 h-5" style={{ color: panel.color }} />
                                </div>
                                <ChevronRight
                                    className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform"
                                    style={{ color: panel.color }}
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-base">{panel.title}</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{panel.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
