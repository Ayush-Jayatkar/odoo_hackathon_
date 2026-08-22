// GET /api/dashboard - returns all data needed for the employee dashboard home
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.userId

    // Current month bounds
    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

    // Attendance for this month
    const attendance = await prisma.attendance.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
    })

    // Leave requests
    const leaves = await prisma.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    })

    // Counts
    const presentDays = attendance.filter((a) => a.status === 'PRESENT').length
    const absentDays = attendance.filter((a) => a.status === 'ABSENT').length
    const halfDays = attendance.filter((a) => a.status === 'HALF_DAY').length
    const leaveDays = attendance.filter((a) => a.status === 'LEAVE').length

    // Leave balances (simple: total - approved)
    const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED')
    const usedSick = approvedLeaves.filter((l) => l.leaveType === 'SICK').length
    const usedPaid = approvedLeaves.filter((l) => l.leaveType === 'PAID').length

    // Recent activity - last 5 events (attendance + leaves combined, sorted by date)
    const recentAttendance = attendance.slice(0, 5).map((a) => ({
        type: 'attendance' as const,
        date: a.date,
        status: a.status,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
    }))

    const recentLeaves = leaves.slice(0, 5).map((l) => ({
        type: 'leave' as const,
        date: l.createdAt,
        leaveType: l.leaveType,
        status: l.status,
        startDate: l.startDate,
        endDate: l.endDate,
    }))

    const recentActivity = [...recentAttendance, ...recentLeaves]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    // Today's attendance
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const todayAttendance = attendance.find(
        (a) => new Date(a.date).toDateString() === todayStart.toDateString()
    )

    return NextResponse.json({
        attendance: {
            presentDays,
            absentDays,
            halfDays,
            leaveDays,
            totalRecorded: attendance.length,
        },
        leaveBalance: {
            sick: Math.max(0, 12 - usedSick),
            paid: Math.max(0, 18 - usedPaid),
        },
        todayStatus: todayAttendance?.status ?? null,
        todayCheckIn: todayAttendance?.checkIn ?? null,
        todayCheckOut: todayAttendance?.checkOut ?? null,
        recentActivity,
        pendingLeaves: leaves.filter((l) => l.status === 'PENDING').length,
    })
}
