import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { LeaveClient } from './LeaveClient'

export default async function EmployeeLeavePage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const leaves = await prisma.leaveRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-5xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Leave Management</h1>
            <LeaveClient records={leaves} />
        </div>
    )
}
