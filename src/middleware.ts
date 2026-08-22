import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT decoder for Edge runtime (doesn't verify signature)
// Actual verification happens in Server Components/API routes via getSession()
function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('dayflow_token')?.value
    const { pathname } = request.nextUrl

    // Allow public routes
    if (
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')
    ) {
        // If logged in, redirect away from login/signup
        if (token && (pathname === '/login' || pathname === '/signup')) {
            const payload = decodeJwt(token)
            if (payload) {
                if (payload.role === 'ADMIN') {
                    return NextResponse.redirect(new URL('/admin', request.url))
                }
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
        return NextResponse.next()
    }

    // Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = decodeJwt(token)

    if (!payload) {
        // Invalid token format, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('dayflow_token')
        return response
    }

    // Role-based protection
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Root redirect
    if (pathname === '/') {
        if (payload.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
