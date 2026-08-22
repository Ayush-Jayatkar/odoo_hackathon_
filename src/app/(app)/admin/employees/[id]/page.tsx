import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { EmployeeDetailClient } from './EmployeeDetailClient'

export default async function EmployeeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const { id } = await params

    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

    const [employee, allEmployees] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                salary: true,
                attendance: {
                    where: { date: { gte: monthStart, lte: monthEnd } },
                    orderBy: { date: 'asc' },
                },
                leaveRequests: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        }),
        prisma.user.findMany({
            where: { role: 'EMPLOYEE' },
            select: {
                id: true,
                profile: { select: { fullName: true } },
                employeeId: true,
            },
            orderBy: { createdAt: 'asc' },
        }),
    ])

    if (!employee || employee.role !== 'EMPLOYEE') notFound()

    // Shape data for the client
    const userData = {
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        role: employee.role,
        profile: employee.profile
            ? {
                  fullName: employee.profile.fullName,
                  phone: employee.profile.phone,
                  address: employee.profile.address,
                  jobTitle: employee.profile.jobTitle,
                  department: employee.profile.department,
                  dateOfJoining: employee.profile.dateOfJoining
                      ? employee.profile.dateOfJoining.toISOString()
                      : null,
                  profilePicUrl: employee.profile.profilePicUrl,
              }
            : null,
        salary: employee.salary
            ? {
                  baseSalary: employee.salary.baseSalary,
                  allowances: employee.salary.allowances,
                  deductions: employee.salary.deductions,
                  netSalary:
                      employee.salary.baseSalary +
                      employee.salary.allowances -
                      employee.salary.deductions,
                  effectiveDate: employee.salary.effectiveDate.toISOString(),
                  employeeName: employee.profile?.fullName ?? 'Employee',
                  employeeId: employee.employeeId,
                  department: employee.profile?.department ?? 'N/A',
              }
            : null,
        attendance: employee.attendance.map((a) => ({
            id: a.id,
            date: a.date.toISOString(),
            checkIn: a.checkIn ? a.checkIn.toISOString() : null,
            checkOut: a.checkOut ? a.checkOut.toISOString() : null,
            status: a.status,
        })),
        leaveRequests: employee.leaveRequests.map((l) => ({
            id: l.id,
            leaveType: l.leaveType,
            startDate: l.startDate.toISOString(),
            endDate: l.endDate.toISOString(),
            remarks: l.remarks,
            status: l.status,
            adminComment: l.adminComment,
            createdAt: l.createdAt.toISOString(),
        })),
    }

    const employeeList = allEmployees.map((e) => ({
        id: e.id,
        name: e.profile?.fullName ?? e.employeeId,
        employeeId: e.employeeId,
    }))

    return (
        <EmployeeDetailClient
            employeeData={userData}
            employeeList={employeeList}
            currentMonth={now.getUTCMonth()}
            currentYear={now.getUTCFullYear()}
        />
    )
}
