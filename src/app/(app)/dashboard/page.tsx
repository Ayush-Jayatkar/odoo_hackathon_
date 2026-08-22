import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CalendarCheck, CalendarOff, Banknote, User } from 'lucide-react'
import { FlowLine } from '@/components/ui/flow-line'

async function getDashboardData(userId: string) {
    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

    const [attendance, leaves, profile, salary] = await Promise.all([
        prisma.attendance.findMany({
            where: { userId, date: { gte: monthStart, lte: monthEnd } },
            orderBy: { date: 'desc' },
        }),
        prisma.leaveRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        prisma.profile.findUnique({ where: { userId } }),
        prisma.salary.findUnique({ where: { userId } }),
    ])

    const presentDays = attendance.filter((a) => a.status === 'PRESENT').length
    const absentDays = attendance.filter((a) => a.status === 'ABSENT').length
    const halfDays = attendance.filter((a) => a.status === 'HALF_DAY').length

    const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED')
    const usedSick = approvedLeaves.filter((l) => l.leaveType === 'SICK').length
    const usedPaid = approvedLeaves.filter((l) => l.leaveType === 'PAID').length

    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const todayAttendance = attendance.find(
        (a) => new Date(a.date).toISOString().slice(0, 10) === todayUTC.toISOString().slice(0, 10)
    )

    const recentActivity = [
        ...attendance.slice(0, 5).map((a) => ({
            type: 'attendance' as const,
            date: a.date,
            status: a.status,
            checkIn: a.checkIn,
        })),
        ...leaves.slice(0, 5).map((l) => ({
            type: 'leave' as const,
            date: l.createdAt,
            leaveType: l.leaveType,
            status: l.status,
        })),
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    return {
        profile,
        salary,
        attendance: { presentDays, absentDays, halfDays, total: attendance.length },
        leaveBalance: { sick: Math.max(0, 12 - usedSick), paid: Math.max(0, 18 - usedPaid) },
        todayStatus: todayAttendance?.status ?? null,
        todayCheckIn: todayAttendance?.checkIn ?? null,
        pendingLeaves: leaves.filter((l) => l.status === 'PENDING').length,
        recentActivity,
    }
}

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'text-[var(--meadow)] bg-[var(--meadow)]/10',
    ABSENT: 'text-[var(--rose)] bg-[var(--rose)]/10',
    HALF_DAY: 'text-[var(--dawn)] bg-[var(--dawn)]/10',
    LEAVE: 'text-[var(--dusk)] bg-[var(--dusk)]/10',
    PENDING: 'text-[var(--dawn)] bg-[var(--dawn)]/10',
    APPROVED: 'text-[var(--meadow)] bg-[var(--meadow)]/10',
    REJECTED: 'text-[var(--rose)] bg-[var(--rose)]/10',
}

export default async function EmployeeDashboard() {
    const session = await getSession()
    if (!session) redirect('/login')

    const data = await getDashboardData(session.userId)
    const firstName = session.name.split(' ')[0]

    // Get current hour for greeting
    const hour = new Date().getUTCHours() + 5.5 // IST offset
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const quickLinks = [
        { title: 'Profile', desc: 'View & edit your details', href: '/profile', icon: User, color: 'var(--midday)' },
        { title: 'Attendance', desc: 'Check-in and history', href: '/attendance', icon: CalendarCheck, color: 'var(--meadow)' },
        { title: 'Leave', desc: 'Apply or track leave', href: '/leave', icon: CalendarOff, color: 'var(--dusk)' },
        { title: 'Payroll', desc: 'Salary slips & details', href: '/payroll', icon: Banknote, color: 'var(--dawn)' },
    ]

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Hero card with FlowLine top accent */}
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <FlowLine />
                <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-1">{greeting}</p>
                    <h1 className="text-3xl font-serif font-bold text-foreground">{firstName} 👋</h1>
                    {data.profile?.jobTitle && (
                        <p className="text-muted-foreground mt-1">
                            {data.profile.jobTitle}
                            {data.profile.department ? ` · ${data.profile.department}` : ''}
                        </p>
                    )}

                    {/* Today status pill */}
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground">Today:</span>
                        {data.todayStatus ? (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[data.todayStatus] ?? ''}`}>
                                {data.todayStatus.replace('_', ' ')}
                                {data.todayCheckIn
                                    ? ` · In ${new Date(data.todayCheckIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                    : ''}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full text-muted-foreground bg-secondary">Not recorded</span>
                        )}
                        {data.pendingLeaves > 0 && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full text-[var(--dawn)] bg-[var(--dawn)]/10">
                                {data.pendingLeaves} leave{data.pendingLeaves > 1 ? 's' : ''} pending
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick-access cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group bg-card rounded-xl shadow-soft p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: `color-mix(in srgb, ${link.color} 15%, transparent)` }}
                            >
                                <link.icon className="w-5 h-5" style={{ color: link.color }} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{link.title}</p>
                                <p className="text-xs text-muted-foreground">{link.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Attendance summary + Leave balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance this month */}
                <div className="bg-card rounded-xl shadow-soft p-6">
                    <h2 className="font-semibold mb-4">This Month's Attendance</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Present', value: data.attendance.presentDays, color: 'var(--meadow)' },
                            { label: 'Absent', value: data.attendance.absentDays, color: 'var(--rose)' },
                            { label: 'Half Days', value: data.attendance.halfDays, color: 'var(--dawn)' },
                            { label: 'Recorded', value: data.attendance.total, color: 'var(--midday)' },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col">
                                <span className="text-3xl font-mono font-bold" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leave balance */}
                <div className="bg-card rounded-xl shadow-soft p-6">
                    <h2 className="font-semibold mb-4">Leave Balance</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Sick Leave', value: data.leaveBalance.sick, max: 12, color: 'var(--dusk)' },
                            { label: 'Paid Leave', value: data.leaveBalance.paid, max: 18, color: 'var(--midday)' },
                        ].map((lb) => (
                            <div key={lb.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{lb.label}</span>
                                    <span className="font-mono font-semibold" style={{ color: lb.color }}>
                                        {lb.value} / {lb.max}
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${(lb.value / lb.max) * 100}%`, background: lb.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="bg-card rounded-xl shadow-soft p-6">
                <h2 className="font-semibold mb-4">Recent Activity</h2>
                {data.recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                ) : (
                    <ul className="space-y-3">
                        {data.recentActivity.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    {item.type === 'attendance' ? (
                                        <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <CalendarOff className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium capitalize">
                                        {item.type === 'attendance'
                                            ? `${item.status?.replace('_', ' ') ?? 'Attendance'}`
                                            : `${(item as { leaveType?: string }).leaveType ?? 'Leave'} leave request`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[item.status ?? ''] ?? 'bg-secondary text-muted-foreground'}`}>
                                    {item.status?.replace('_', ' ') ?? '—'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
