import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const patchSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    adminComment: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const result = patchSchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { status, adminComment } = result.data

    const leave = await prisma.leaveRequest.findUnique({ where: { id } })
    if (!leave) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })

    if (leave.status !== 'PENDING') {
        return NextResponse.json({ error: 'Leave request is already processed' }, { status: 400 })
    }

    const updatedLeave = await prisma.leaveRequest.update({
        where: { id },
        data: {
            status,
            adminComment,
            reviewedById: session.userId,
            reviewedAt: new Date(),
        },
    })

    // If approved, create matching Attendance rows with status LEAVE
    if (status === 'APPROVED') {
        const start = new Date(leave.startDate)
        const end = new Date(leave.endDate)
        const attendanceData = []

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            attendanceData.push({
                userId: leave.userId,
                date: new Date(d),
                status: 'LEAVE',
            })
        }

        // Upsert each attendance record to avoid unique constraint violations
        for (const data of attendanceData) {
            await prisma.attendance.upsert({
                where: {
                    userId_date: {
                        userId: data.userId,
                        date: data.date,
                    },
                },
                update: {
                    status: 'LEAVE',
                },
                create: data,
            })
        }
    }

    return NextResponse.json({ leave: updatedLeave })
}
