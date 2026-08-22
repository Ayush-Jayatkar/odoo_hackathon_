import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId: session.userId,
                date: todayUTC,
            },
        },
    })

    if (!existing || !existing.checkIn) {
        return NextResponse.json({ error: 'Must check in first' }, { status: 400 })
    }

    if (existing.checkOut) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 })
    }

    // Rule: If checkout is under 4 hours after check-in, mark as HALF_DAY
    const hoursWorked = (now.getTime() - existing.checkIn.getTime()) / (1000 * 60 * 60)
    const status = hoursWorked < 4 ? 'HALF_DAY' : 'PRESENT'

    const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
            checkOut: now,
            status,
        },
    })

    return NextResponse.json({ attendance, hoursWorked })
}
