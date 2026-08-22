import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const verifySchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits'),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = verifySchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
        }

        const { email, code } = result.data

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
        }

        if (user.verifyCode !== code) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyCode: null,
            },
        })

        return NextResponse.json({ message: 'Email verified successfully' })
    } catch (error) {
        console.error('Verify error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
