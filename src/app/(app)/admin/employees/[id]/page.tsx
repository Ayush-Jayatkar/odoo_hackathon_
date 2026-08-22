import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/dashboard')

    const { id } = await params
    const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true, salary: true },
    })
    if (!user) notFound()

    const rows: [string, string][] = [
        ['Employee ID', user.employeeId],
        ['Email', user.email],
        ['Full Name', user.profile?.fullName ?? '—'],
        ['Phone', user.profile?.phone ?? '—'],
        ['Job Title', user.profile?.jobTitle ?? '—'],
        ['Department', user.profile?.department ?? '—'],
        ['Address', user.profile?.address ?? '—'],
    ]

    return (
        <div className="max-w-xl space-y-6">
            <h1 className="text-2xl font-serif font-bold">{user.profile?.fullName ?? user.email}</h1>
            <div className="bg-card rounded-2xl shadow-soft p-6 divide-y">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between py-3 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}