# Dayflow

**Streamlined employee management, attendance tracking, and payroll processing in one unified portal.**

Dayflow is a modern, responsive web application built for the Odoo Hackathon. It solves the complexity of HR operations by providing a clean, intuitive dashboard where employees can check in/out, view their payslips, and request leave, while administrators get powerful tools to oversee attendance, manage personnel, and approve requests.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **UI Components**: Shadcn UI, Base UI, Lucide React (Icons)
- **Data Visualization**: Recharts
- **Authentication**: JWT & bcryptjs
- **Form Validation**: Zod
- **Email/Notifications**: Resend (API)
- **PDF Generation**: jsPDF

---

## 🛠️ Setup & Installation

Follow these steps to get the project running locally:

### 1. Clone the repository
```bash
git clone https://github.com/Ayush-Jayatkar/odoo_hackathon_.git
cd odoo_hackathon_
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory based on the provided `.env.example`:
```bash
cp .env.example .env
```
Ensure you have a `JWT_SECRET` set in your `.env` file.

### 4. Setup the database
Run the Prisma migrations to initialize the SQLite database:
```bash
npx prisma migrate dev
```

### 5. Seed the database with mock data
Seed the database with sample employees, attendance records, leaves, and an admin account:
```bash
npm run db:seed
```

### 6. Start the development server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🔑 Test Credentials

Use these seeded accounts to test the application flows:

### Administrator
- **Email**: `admin@dayflow.dev`
- **Password**: `Admin@123`

### Employee
- **Email**: `arjun.sharma@dayflow.dev` (or any other seeded employee email)
- **Password**: `Employee@123`

---

## 📸 Screenshots

### Employee Dashboard
![Employee Dashboard](./screenshots/5_employee_dashboard.png)

### Admin Attendance Overview
![Admin Attendance Overview](./screenshots/1_admin_dashboard.png)

### Admin Analytics
![Admin Analytics](./screenshots/3_admin_analytics.png)

### Admin Employee Management
![Employee Management](./screenshots/2_admin_employees.png)

🏆 Odoo Hackathon

Dayflow was developed as a project for the Odoo Hackathon.

The project focuses on bringing employee-facing and administrator-facing HR workflows together into a single, straightforward portal.

The goal is to reduce the friction of common HR operations by providing a centralized interface for:

Employee attendance
Leave requests
Payslips
Employee management
Attendance oversight
HR analytics
Administrative approvals

📜 License

No license information is specified in the provided project documentation.
Refer to the repository for the current licensing information.

🔒 Security Considerations

For development and demonstration purposes, Dayflow uses seeded accounts and local configuration.

When deploying or extending the application:

Keep secrets in environment variables.
Do not commit .env files containing sensitive values.
Do not expose private API credentials to the browser.
Use a strong, unique JWT_SECRET.
Do not reuse the demo credentials in a production environment.
Ensure administrative functionality remains protected by appropriate authorization.
