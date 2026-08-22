import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AttendanceClient } from './AttendanceClient'

export default async function EmployeeAttendancePage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

    const attendance = await prisma.attendance.findMany({
        where: {
            userId: session.userId,
            date: { gte: monthStart, lte: monthEnd },
        },
        orderBy: { date: 'asc' },
    })

    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const todayRecord = attendance.find(
        (a) => new Date(a.date).toISOString().slice(0, 10) === todayUTC.toISOString().slice(0, 10)
    )

    return (
        <div className="max-w-5xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Attendance</h1>
            <AttendanceClient
                records={attendance}
                todayRecord={todayRecord || null}
                currentMonth={now.getUTCMonth()}
                currentYear={now.getUTCFullYear()}
            />
        </div>
    )
}
