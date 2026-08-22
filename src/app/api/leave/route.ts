import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const leaveSchema = z.object({
    leaveType: z.enum(['SICK', 'PAID', 'UNPAID']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    remarks: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
}).refine((data) => data.leaveType !== 'UNPAID' || (data.remarks && data.remarks.length > 0), {
    message: 'Remarks are required for unpaid leave',
    path: ['remarks'],
})

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = leaveSchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { leaveType, startDate, endDate, remarks } = result.data
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check for overlaps with existing PENDING or APPROVED requests
    const overlapping = await prisma.leaveRequest.findFirst({
        where: {
            userId: session.userId,
            status: { in: ['PENDING', 'APPROVED'] },
            OR: [
                { startDate: { lte: end }, endDate: { gte: start } },
            ],
        },
    })

    if (overlapping) {
        return NextResponse.json({ error: 'Leave request overlaps with an existing pending or approved request' }, { status: 400 })
    }

    const leave = await prisma.leaveRequest.create({
        data: {
            userId: session.userId,
            leaveType,
            startDate: start,
            endDate: end,
            remarks,
            status: 'PENDING',
        },
    })

    return NextResponse.json({ leave })
}

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.role === 'ADMIN') {
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
        return NextResponse.json({ leaves })
    } else {
        const leaves = await prisma.leaveRequest.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ leaves })
    }
}
