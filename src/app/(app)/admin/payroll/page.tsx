import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AdminPayrollClient } from './AdminPayrollClient'

export default async function AdminPayrollPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        include: {
            profile: true,
            salary: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Payroll Management</h1>
            <AdminPayrollClient employees={employees} />
        </div>
    )
}
