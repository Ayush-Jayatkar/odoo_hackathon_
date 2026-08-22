import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from './AnalyticsClient'

export default async function AdminAnalyticsPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // 1. Attendance trend over the last 30 days
    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            date: { gte: thirtyDaysAgo },
        },
        select: {
            date: true,
            status: true,
        },
    })

    // Process attendance into an array of { date, PRESENT, ABSENT, HALF_DAY, LEAVE }
    const trendMap = new Map<string, { date: string, PRESENT: number, ABSENT: number, HALF_DAY: number, LEAVE: number }>()
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        trendMap.set(dateStr, { date: dateStr, PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 })
    }

    attendanceRecords.forEach((record) => {
        const dateStr = record.date.toISOString().split('T')[0]
        const entry = trendMap.get(dateStr)
        if (entry) {
            // @ts-ignore
            entry[record.status] = (entry[record.status] || 0) + 1
        }
    })

    const attendanceTrend = Array.from(trendMap.values())

    // 2. Leave requests by type
    const leaveRequests = await prisma.leaveRequest.groupBy({
        by: ['leaveType'],
        _count: {
            id: true,
        },
    })

    const leaveDistribution = leaveRequests.map((l) => ({
        name: l.leaveType,
        value: l._count.id,
    }))

    // 3. Department headcount
    const profiles = await prisma.profile.findMany({
        select: { department: true },
        where: { user: { role: 'EMPLOYEE' } }
    })

    const deptMap = new Map<string, number>()
    profiles.forEach((p) => {
        const dept = p.department || 'Unassigned'
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
    })

    const departmentHeadcount = Array.from(deptMap.entries()).map(([name, headcount]) => ({
        name,
        headcount,
    }))

    return (
        <div className="max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Analytics Overview</h1>
                <p className="text-muted-foreground mt-1">Live data insights across the organization.</p>
            </div>
            
            <AnalyticsClient 
                attendanceTrend={attendanceTrend} 
                leaveDistribution={leaveDistribution} 
                departmentHeadcount={departmentHeadcount} 
            />
        </div>
    )
}
