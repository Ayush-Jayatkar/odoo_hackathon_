import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { Resend } from 'resend'

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
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
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
        include: {
            user: { include: { profile: true } },
        },
    })

    // 1. Create in-app notification
    await prisma.notification.create({
        data: {
            userId: updatedLeave.userId,
            message: `Your leave request from ${new Date(updatedLeave.startDate).toLocaleDateString('en-IN')} to ${new Date(updatedLeave.endDate).toLocaleDateString('en-IN')} was ${status.toLowerCase()}.`,
            type: status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        }
    })

    // 2. Optional Email Alert (fails silently if no API key)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY)
            const userName = updatedLeave.user.profile?.fullName ?? 'Employee'
            await resend.emails.send({
                from: 'Dayflow HRMS <onboarding@resend.dev>',
                to: updatedLeave.user.email,
                subject: `Leave Request ${status}`,
                html: `<p>Hi ${userName},</p>
                       <p>Your leave request has been <strong>${status}</strong>.</p>
                       ${adminComment ? `<p>Admin Comment: ${adminComment}</p>` : ''}`
            })
        } catch (e) {
            console.error('Failed to send Resend email:', e)
        }
    }

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
