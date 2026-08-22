const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs');

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('Starting Next.js server...');
    const serverProcess = exec('npm run start', { cwd: __dirname });

    serverProcess.stdout.on('data', data => console.log(`[Next] ${data.toString().trim()}`));
    serverProcess.stderr.on('data', data => console.error(`[Next Error] ${data.toString().trim()}`));

    // Wait for server to be ready
    console.log('Waiting 10s for server to start...');
    await wait(10000);

    const screenshotsDir = './screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('--- ADMIN JOURNEY ---');
        // Admin Login
        await page.goto('http://localhost:3000/login');
        await page.type('input[name="email"]', 'admin@dayflow.dev');
        await page.type('input[name="password"]', 'Admin123');
        await page.click('button[type="submit"]');
        await wait(2000);
        await page.screenshot({ path: `${screenshotsDir}/1_admin_dashboard.png` });
        console.log('Took 1_admin_dashboard.png');

        // Admin Employees
        await page.goto('http://localhost:3000/admin/employees');
        await wait(1500);
        await page.screenshot({ path: `${screenshotsDir}/2_admin_employees.png` });
        console.log('Took 2_admin_employees.png');

        // Admin Analytics
        await page.goto('http://localhost:3000/admin/analytics');
        await wait(2000); // Recharts takes a bit
        await page.screenshot({ path: `${screenshotsDir}/3_admin_analytics.png` });
        console.log('Took 3_admin_analytics.png');
        
        // Admin Approvals
        await page.goto('http://localhost:3000/admin/approvals');
        await wait(1500);
        await page.screenshot({ path: `${screenshotsDir}/4_admin_approvals.png` });
        console.log('Took 4_admin_approvals.png');

        // Clear cookies to logout
        const cookies = await page.cookies();
        await page.deleteCookie(...cookies);

        console.log('--- EMPLOYEE JOURNEY ---');
        // Employee Login
        await page.goto('http://localhost:3000/login');
        await page.type('input[name="email"]', 'jane@example.com');
        await page.type('input[name="password"]', 'Password123');
        await page.click('button[type="submit"]');
        await wait(2000);
        await page.screenshot({ path: `${screenshotsDir}/5_employee_dashboard.png` });
        console.log('Took 5_employee_dashboard.png');

        // Employee Attendance (Check in flow)
        await page.goto('http://localhost:3000/attendance');
        await wait(1500);
        await page.screenshot({ path: `${screenshotsDir}/6_employee_attendance.png` });
        console.log('Took 6_employee_attendance.png');
        
        // Employee Profile
        await page.goto('http://localhost:3000/profile');
        await wait(1500);
        await page.screenshot({ path: `${screenshotsDir}/7_employee_profile.png` });
        console.log('Took 7_employee_profile.png');
    } catch (err) {
        console.error('Error during journey:', err);
    } finally {
        await browser.close();
        console.log('Browser closed. Terminating server...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    }
}

run();
