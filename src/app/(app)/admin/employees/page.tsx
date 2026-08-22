import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { EmployeesClient } from './EmployeesClient'

export default async function AdminEmployeesPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        include: { profile: true },
        orderBy: { createdAt: 'asc' },
    })

    const departments = Array.from(
        new Set(employees.map((e) => e.profile?.department).filter(Boolean))
    ) as string[]

    const employeeData = employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        email: e.email,
        role: e.role,
        createdAt: e.createdAt.toISOString(),
        profile: e.profile
            ? {
                  fullName: e.profile.fullName,
                  jobTitle: e.profile.jobTitle,
                  department: e.profile.department,
                  profilePicUrl: e.profile.profilePicUrl,
              }
            : null,
    }))

    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Employees</h1>
            <EmployeesClient employees={employeeData} departments={departments} />
        </div>
    )
}
