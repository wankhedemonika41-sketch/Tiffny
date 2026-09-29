# Tiffny

Tiffny is a web-based platform that connects students with mess owners and tiffin/home-meal providers.

The platform allows students to discover available messes, select meal plans, place orders, and manage their meals. Mess owners can register their mess, submit their profile for verification, manage their menu, capacity, pricing, orders, and reviews.

---

## Project Overview

Tiffny is designed to make the process of finding and managing mess/tiffin services easier for students while providing mess owners with a platform to manage their services.

The system contains three main roles:

- Student
- Mess Owner
- Admin

---

## Main Features

### Student

- Student registration
- Student login
- JWT authentication
- Student profile
- Location-based mess discovery
- View approved messes
- View mess information
- One-Day meal ordering
- Monthly meal plans
- Eat-at-Mess option
- Tiffin option
- Order history
- Active meal plan
- Payments
- Ratings and reviews

---

### Mess Owner

- Mess owner registration
- Mess owner login
- JWT authentication
- Mess profile creation
- Mess information management
- Mess address and location
- Mess image upload
- Verification proof upload
- Admin verification status
- Menu management
- Capacity management
- Monthly price management
- View student orders
- Update order status
- View ratings and reviews

---

### Admin

- Admin authentication
- Mess owner verification
- Approve mess
- Reject mess
- Suspend mess
- Reactivate mess
- Manage the verification process

---

## Current Authentication

Tiffny uses JWT-based authentication.

The backend provides role-based access for:

- STUDENT
- MESS_OWNER
- ADMIN

Protected backend routes require an authentication token.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Python
- FastAPI
- JWT Authentication
- Pydantic
- PyMongo

### Database

- MongoDB

### Development Tools

- Visual Studio Code
- Git
- GitHub

---

## Project Structure

```text
tiffny/
│
├── backend/
│   │
│   ├── main.py
│   ├── database.py
│   │
│   ├── auth/
│   │   ├── auth_utils.py
│   │   ├── auth_jwt.py
│   │   ├── auth_dependency.py
│   │   └── auth_roles.py
│   │
│   ├── models/
│   │   ├── user_model.py
│   │   ├── mess_model.py
│   │   ├── menu_model.py
│   │   ├── order_model.py
│   │   ├── payment_model.py
│   │   └── review_model.py
│   │
│   ├── schemas/
│   │   ├── user_schema.py
│   │   ├── login_schema.py
│   │   ├── student_schema.py
│   │   ├── mess_schema.py
│   │   ├── menu_schema.py
│   │   ├── capacity_schema.py
│   │   ├── monthly_price_schema.py
│   │   ├── order_schema.py
│   │   ├── payment_schema.py
│   │   └── review_schema.py
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── student_routes.py
│   │   ├── mess_routes.py
│   │   ├── admin_routes.py
│   │   ├── order_routes.py
│   │   ├── payment_routes.py
│   │   └── review_routes.py
│   │
│   └── uploads/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md