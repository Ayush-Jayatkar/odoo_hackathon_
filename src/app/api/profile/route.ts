import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// Phone: optional, but if provided must match +91-XXXXXXXXXX or similar formats
const phoneRegex = /^(\+\d{1,3}[-\s]?)?(\d{10}|\d{3}[-\s]\d{3}[-\s]\d{4})$/

const patchSchema = z.object({
    phone: z
        .string()
        .optional()
        .refine((v) => !v || phoneRegex.test(v), {
            message: 'Invalid phone number format',
        }),
    address: z.string().max(300).optional(),
    profilePicUrl: z.string().max(2_000_000).optional(), // allow base64 data URL
})

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true, salary: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        profile: user.profile,
        salary: user.salary
            ? {
                netSalary: user.salary.baseSalary + user.salary.allowances - user.salary.deductions,
                baseSalary: user.salary.baseSalary,
                allowances: user.salary.allowances,
                deductions: user.salary.deductions,
            }
            : null,
    })
}

export async function PATCH(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = patchSchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { phone, address, profilePicUrl } = result.data

    const profile = await prisma.profile.update({
        where: { userId: session.userId },
        data: {
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(profilePicUrl !== undefined && { profilePicUrl }),
        },
    })

    return NextResponse.json({ profile })
}
