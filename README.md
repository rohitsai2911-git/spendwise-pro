# SpendWise Pro

> **Smart Personal Finance & Expense Management Platform**

A production-grade full stack Java application for tracking personal finances, managing expenses, setting budgets, and achieving savings goals.

## Features

### Dashboard
- Monthly income, expense, and remaining balance overview
- Budget utilization tracking and financial health score
- Interactive charts (pie, bar, area) for expense categories and trends
- Recent transactions feed with quick access

### Expense Management
- Full CRUD operations with pagination
- Filter by type (income/expense), category, payment method
- Global search with debounced results
- CSV and PDF export

### Budget System
- Category-wise monthly budgets with progress bars
- Utilization percentage and remaining budget tracking
- Over-budget and threshold alerts
- Automatic spent amount refresh

### Goal Tracking
- Set financial goals with target amounts and dates
- Add incremental progress toward goals
- Visual progress bars with auto-completion
- Custom icons and colors per goal

### Reports
- Daily, weekly, monthly, and yearly financial reports
- Category breakdown with pie charts
- Income vs expense comparison
- Savings rate and average daily expense calculation
- PDF download capability

### Authentication & Security
- JWT-based authentication with remember-me support
- BCrypt password encoding
- Role-based access control (USER, ADMIN)
- Password reset flow with email tokens
- Protected routes and API endpoints

### Notifications
- Budget exceeded alerts
- Goal achievement celebrations
- Unread notification count with badge
- Mark individual or all as read

### Admin Panel
- System statistics dashboard
- User management with role oversight
- System-wide analytics

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Language |
| Spring Boot 3.2 | Framework |
| Spring Security | Authentication & Authorization |
| JWT (jjwt) | Token-based auth |
| Spring Data JPA / Hibernate | ORM & Data Access |
| MySQL | Database |
| Maven | Build tool |
| Lombok | Boilerplate reduction |
| OpenCSV | CSV export |
| SpringDoc OpenAPI | API documentation |
| Validation API | Input validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Framer Motion 10 | Animations |
| Recharts 2 | Charts |
| React Router 6 | Routing |
| React Hook Form | Forms |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| Axios | HTTP client |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │   Auth    │  │Dashboard │  │   Feature Pages      │  │
│  │  Pages    │  │  Charts  │  │ (Txns, Budgets, etc) │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       └──────────────┴──────────────────┘               │
│                        │ Axios                           │
│                   ┌────┴─────┐                          │
│                   │ JWT Token │                          │
│                   └────┬─────┘                          │
└────────────────────────┼────────────────────────────────┘
                         │ REST API
┌────────────────────────┼────────────────────────────────┐
│            Backend (Spring Boot)                        │
│  ┌────┴─────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │   JWT     │  │  Auth    │  │   Controllers        │  │
│  │   Filter  │  │ Manager  │  │                      │  │
│  └──────────┘  └──────────┘  └──────────┬───────────┘  │
│                                         │               │
│  ┌──────────────────────────────────────┴────────────┐  │
│  │              Service Layer                         │  │
│  └──────────────────────────────────────┬────────────┘  │
│                                         │               │
│  ┌──────────────────────────────────────┴────────────┐  │
│  │              Repository Layer (JPA)                │  │
│  └──────────────────────────────────────┬────────────┘  │
│                                         │               │
│  ┌──────────────────────────────────────┴────────────┐  │
│  │              MySQL Database                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
spendwise-pro/
├── backend/
│   └── spendwise-api/
│       ├── pom.xml
│       └── src/main/java/com/spendwise/
│           ├── SpendWiseApplication.java
│           ├── config/
│           │   ├── SecurityConfig.java
│           │   ├── CorsConfig.java
│           │   └── SwaggerConfig.java
│           ├── controller/
│           │   ├── AuthController.java
│           │   ├── TransactionController.java
│           │   ├── BudgetController.java
│           │   ├── GoalController.java
│           │   ├── DashboardController.java
│           │   ├── NotificationController.java
│           │   ├── CategoryController.java
│           │   ├── ReportController.java
│           │   ├── SearchController.java
│           │   └── AdminController.java
│           ├── dto/
│           │   ├── request/
│           │   └── response/
│           ├── entity/
│           │   ├── User.java
│           │   ├── Transaction.java
│           │   ├── Budget.java
│           │   ├── Goal.java
│           │   ├── Category.java
│           │   └── Notification.java
│           ├── enums/
│           ├── exception/
│           │   └── GlobalExceptionHandler.java
│           ├── repository/
│           ├── security/
│           │   ├── JwtTokenProvider.java
│           │   ├── JwtAuthenticationFilter.java
│           │   ├── CustomUserDetailsService.java
│           │   └── UserPrincipal.java
│           └── service/
│               ├── impl/
│               └── (interfaces)
├── frontend/
│   └── spendwise-ui/
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── src/
│           ├── main.jsx
│           ├── App.jsx
│           ├── api/
│           ├── components/
│           │   ├── auth/
│           │   ├── common/
│           │   ├── dashboard/
│           │   └── ...
│           ├── context/
│           ├── hooks/
│           ├── layouts/
│           ├── pages/
│           ├── utils/
│           └── styles/
└── README.md
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/{id}` | Get transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/export/csv` | Export CSV |
| GET | `/api/transactions/export/pdf` | Export PDF |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |
| POST | `/api/goals/{id}/progress` | Add progress |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/weekly` | Weekly report |
| GET | `/api/reports/monthly` | Monthly report |
| GET | `/api/reports/yearly` | Yearly report |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=` | Global search |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/statistics` | System statistics |

Full API documentation available at `/swagger-ui.html` when the server is running.

## Installation

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8+
- Maven 3.9+

### Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd spendwise-pro/backend/spendwise-api

# Configure MySQL database
mysql -u root -p -e "CREATE DATABASE spendwise_db"

# Update application.yml with your MySQL credentials

# Build and run
mvn clean install
mvn spring-boot:run
```

The API server will start at `http://localhost:8080`.

### Frontend Setup

```bash
cd spendwise-pro/frontend/spendwise-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MAIL_USERNAME` | Gmail address for password reset emails |
| `MAIL_PASSWORD` | Gmail app password |

## Screenshots

> *Screenshots will be added here*

## Database Schema

```
users (id, name, email, password, phone, profile_picture_url,
       monthly_income, role, dark_mode, email_verified,
       reset_password_token, reset_password_token_expiry,
       created_at, updated_at)

transactions (id, user_id, type, amount, description,
              transaction_date, expense_category, income_source,
              payment_method, is_recurring, recurring_frequency,
              next_recurring_date, receipt_url, notes,
              created_at, updated_at)

budgets (id, user_id, category, month, year, budget_amount,
         spent_amount, alert_threshold, created_at, updated_at)

goals (id, user_id, name, target_amount, current_amount,
       target_date, icon, color, status, created_at, updated_at)

notifications (id, user_id, type, title, message, is_read, created_at)

categories (id, name, icon, color, is_default, user_id,
            created_at, updated_at)
```

## Design Decisions

- **8px spacing system** throughout for consistent visual rhythm
- **Inter font family** for clean, modern typography
- **Card-based UI** with subtle shadows and rounded corners
- **Soft color palette** using Tailwind's slate/primary theme
- **Dark mode** with full theme support
- **Framer Motion** for tasteful, performance-conscious animations
- **Responsive design** with mobile-first approach
- **Stateless JWT** authentication with configurable expiration
- **DTO pattern** to separate API contracts from entities
- **Global exception handler** for consistent error responses
- **Service layer** with interface-based design for testability

## Security Considerations

- Passwords hashed with BCrypt
- JWT tokens with configurable expiration and secret
- SQL injection protection via JPA parameterized queries
- CORS restricted to specific origins
- Role-based endpoint authorization
- Input validation on all API endpoints
- XSS prevention via React's built-in escaping
- Sensitive data never returned in API responses

## Future Enhancements

- [ ] Multi-currency support
- [ ] Bank account integration (Plaid/Stripe)
- [ ] Recurring transaction auto-processing
- [ ] Email notification system
- [ ] Bill splitting and shared expenses
- [ ] Investment portfolio tracking
- [ ] Mobile app (React Native)
- [ ] Data import (CSV, OFX, QIF)
- [ ] AI-powered spending insights
- [ ] Receipt OCR scanning
- [ ] Budget rollover between months
- [ ] Tax deduction tracking

## License

MIT License - see LICENSE file for details.

---

Built with Java, Spring Boot, React, and ❤️
