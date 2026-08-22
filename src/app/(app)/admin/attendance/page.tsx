import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AdminAttendanceClient } from './AdminAttendanceClient'

export default async function AdminAttendancePage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    // Fetch all attendance records for the current month by default
    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

    const attendance = await prisma.attendance.findMany({
        where: {
            date: { gte: monthStart, lte: monthEnd },
        },
        include: {
            user: {
                include: {
                    profile: true,
                },
            },
        },
        orderBy: { date: 'desc' },
    })

    // Get unique departments for filtering
    const departments = Array.from(
        new Set(attendance.map((a) => a.user.profile?.department).filter(Boolean))
    ) as string[]

    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Company Attendance</h1>
            <AdminAttendanceClient records={attendance} departments={departments} />
        </div>
    )
}
