import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { PayrollClient } from './PayrollClient'

export default async function EmployeePayrollPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true, salary: true },
    })

    if (!user || !user.salary) {
        return (
            <div className="max-w-3xl space-y-6">
                <h1 className="text-2xl font-serif font-bold">Payroll</h1>
                <div className="bg-card rounded-xl shadow-soft p-8 text-center text-muted-foreground">
                    No salary information available yet.
                </div>
            </div>
        )
    }

    const salaryData = {
        baseSalary: user.salary.baseSalary,
        allowances: user.salary.allowances,
        deductions: user.salary.deductions,
        netSalary: user.salary.baseSalary + user.salary.allowances - user.salary.deductions,
        effectiveDate: user.salary.effectiveDate.toISOString(),
        employeeName: user.profile?.fullName || 'Employee',
        employeeId: user.employeeId,
        department: user.profile?.department || 'N/A',
    }

    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">Payroll</h1>
            <PayrollClient salaryData={salaryData} />
        </div>
    )
}
