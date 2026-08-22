import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId: session.userId,
                date: todayUTC,
            },
        },
    })

    if (existing?.checkIn) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 })
    }

    // Create or update (if a record exists without checkIn, e.g. pre-created as ABSENT)
    const attendance = await prisma.attendance.upsert({
        where: {
            userId_date: {
                userId: session.userId,
                date: todayUTC,
            },
        },
        update: {
            checkIn: now,
            status: 'PRESENT',
        },
        create: {
            userId: session.userId,
            date: todayUTC,
            checkIn: now,
            status: 'PRESENT',
        },
    })

    return NextResponse.json({ attendance })
}
