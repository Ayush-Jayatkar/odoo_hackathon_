import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { comparePassword, signToken, createSessionCookie } from '@/lib/auth'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = loginSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { email, password } = result.data

        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        const isValidPassword = await comparePassword(password, user.passwordHash)

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        if (!user.emailVerified) {
            return NextResponse.json({ error: 'Please verify your email first', requiresVerification: true }, { status: 403 })
        }

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.profile?.fullName || 'User',
        })

        const cookie = createSessionCookie(token)

        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.profile?.fullName,
            },
        })

        response.cookies.set(cookie)

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
