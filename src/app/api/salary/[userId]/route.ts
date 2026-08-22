import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const salarySchema = z.object({
    baseSalary: z.number().min(0),
    allowances: z.number().min(0),
    deductions: z.number().min(0),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await params
    const body = await req.json()
    const result = salarySchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { baseSalary, allowances, deductions } = result.data

    const salary = await prisma.salary.upsert({
        where: { userId },
        update: {
            baseSalary,
            allowances,
            deductions,
            effectiveDate: new Date(),
        },
        create: {
            userId,
            baseSalary,
            allowances,
            deductions,
            effectiveDate: new Date(),
        },
    })

    return NextResponse.json({ salary })
}
