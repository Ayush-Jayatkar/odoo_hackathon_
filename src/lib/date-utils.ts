import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const IST = 'Asia/Kolkata'

/**
 * Get today's date string in YYYY-MM-DD (UTC)
 */
export function todayUTC(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Format a UTC datetime to IST display string
 */
export function toISTDisplay(date: Date | string, fmt = 'dd MMM yyyy, hh:mm a'): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(toZonedTime(d, IST), fmt)
}

/**
 * Format just the time portion in IST
 */
export function toISTTime(date: Date | string): string {
    return toISTDisplay(date, 'hh:mm a')
}

/**
 * Parse a YYYY-MM-DD string to a Date at midnight UTC
 */
export function parseDateUTC(dateStr: string): Date {
    return parseISO(dateStr + 'T00:00:00.000Z')
}

/**
 * Get human-readable label for leave type
 */
export function leaveTypeLabel(type: string): string {
    const map: Record<string, string> = {
        ANNUAL: 'Annual Leave',
        SICK: 'Sick Leave',
        CASUAL: 'Casual Leave',
        UNPAID: 'Unpaid Leave',
    }
    return map[type] ?? type
}
