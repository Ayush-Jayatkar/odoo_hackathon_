import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true, salary: true },
    })

    if (!user) redirect('/login')

    const userData = {
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        profile: user.profile
            ? {
                fullName: user.profile.fullName,
                phone: user.profile.phone,
                address: user.profile.address,
                jobTitle: user.profile.jobTitle,
                department: user.profile.department,
                dateOfJoining: user.profile.dateOfJoining ? user.profile.dateOfJoining.toISOString() : null,
                profilePicUrl: user.profile.profilePicUrl,
            }
            : null,
        salary: user.salary
            ? {
                netSalary: user.salary.baseSalary + user.salary.allowances - user.salary.deductions,
                baseSalary: user.salary.baseSalary,
                allowances: user.salary.allowances,
                deductions: user.salary.deductions,
            }
            : null,
    }

    return <ProfileClient userData={userData} isAdminView={session.role === 'ADMIN'} />
}
