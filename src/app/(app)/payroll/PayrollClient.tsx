'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Banknote } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface SalaryData {
    baseSalary: number
    allowances: number
    deductions: number
    netSalary: number
    effectiveDate: string
    employeeName: string
    employeeId: string
    department: string
}

// For the web UI: proper ₹ symbol via Intl.NumberFormat
const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

// For the PDF: jsPDF's built-in Helvetica font cannot render the ₹ Unicode
// codepoint (U+20B9), so we use the ASCII-safe "Rs." prefix instead.
const formatINRPdf = (amount: number) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

export function PayrollClient({ salaryData }: { salaryData: SalaryData }) {
    const handleDownload = () => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.text('Dayflow HRMS', 20, 20)
        doc.setFontSize(14)
        doc.text('Payslip', 20, 30)

        // Employee Details
        doc.setFontSize(11)
        doc.text(`Employee Name: ${salaryData.employeeName}`, 20, 45)
        doc.text(`Employee ID:   ${salaryData.employeeId}`, 20, 52)
        doc.text(`Department:    ${salaryData.department}`, 20, 59)
        doc.text(`Effective Date: ${new Date(salaryData.effectiveDate).toLocaleDateString('en-IN')}`, 20, 66)

        // Salary table
        doc.setLineWidth(0.5)
        doc.line(20, 75, 190, 75)

        doc.text('Description', 20, 85)
        doc.text('Amount', 150, 85)
        doc.line(20, 90, 190, 90)

        doc.text('Base Salary', 20, 100)
        doc.text(formatINRPdf(salaryData.baseSalary), 150, 100)

        doc.text('Allowances', 20, 110)
        doc.text(formatINRPdf(salaryData.allowances), 150, 110)

        doc.text('Deductions', 20, 120)
        doc.text(`- ${formatINRPdf(salaryData.deductions)}`, 150, 120)

        doc.line(20, 130, 190, 130)

        doc.setFont('helvetica', 'bold')
        doc.text('Net Salary', 20, 140)
        doc.text(formatINRPdf(salaryData.netSalary), 150, 140)

        doc.save(`Payslip_${salaryData.employeeId}_${new Date().toISOString().slice(0, 7)}.pdf`)
    }

    return (
        <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" /> Current Payslip
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Effective Date</p>
                            <p className="font-medium">{new Date(salaryData.effectiveDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Net Salary</p>
                            <p className="text-2xl font-mono font-bold text-[var(--meadow)]">{formatINR(salaryData.netSalary)}</p>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 grid grid-cols-2 font-medium text-sm">
                            <div>Earnings / Deductions</div>
                            <div className="text-right">Amount</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b">
                            <div>Base Salary</div>
                            <div className="text-right font-mono">{formatINR(salaryData.baseSalary)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b">
                            <div>Allowances</div>
                            <div className="text-right font-mono text-[var(--meadow)]">+{formatINR(salaryData.allowances)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b bg-rose/5">
                            <div>Deductions</div>
                            <div className="text-right font-mono text-[var(--rose)]">-{formatINR(salaryData.deductions)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm font-bold bg-muted/20">
                            <div>Total Net Salary</div>
                            <div className="text-right font-mono text-[var(--meadow)]">{formatINR(salaryData.netSalary)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
