import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out successfully' })
    const cookie = clearSessionCookie()
    response.cookies.set(cookie)
    return response
}
