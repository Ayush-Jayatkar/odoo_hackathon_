import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AdminApprovalsClient } from './AdminApprovalsClient'

export default async function AdminApprovalsPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const leaves = await prisma.leaveRequest.findMany({
        include: {
            user: {
                include: {
                    profile: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Leave Approvals</h1>
            <AdminApprovalsClient records={leaves} />
        </div>
    )
}
