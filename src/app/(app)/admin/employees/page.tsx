import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { EmployeesGridClient } from './EmployeesGridClient'

export default async function EmployeesPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const users = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        include: {
            profile: true,
            attendance: { where: { date: today } },
            leaveRequests: {
                where: {
                    status: 'APPROVED',
                    startDate: { lte: today },
                    endDate: { gte: today },
                },
            },
        },
    })

    const employees = users.map((u) => {
        let status: 'PRESENT' | 'LEAVE' | 'ABSENT' = 'ABSENT'
        if (u.leaveRequests.length > 0) status = 'LEAVE'
        else if (u.attendance[0]?.checkIn) status = 'PRESENT'

        return {
            id: u.id,
            employeeId: u.employeeId,
            fullName: u.profile?.fullName ?? u.email,
            jobTitle: u.profile?.jobTitle ?? '—',
            profilePicUrl: u.profile?.profilePicUrl ?? null,
            status,
        }
    })

    return <EmployeesGridClient employees={employees} />
}

