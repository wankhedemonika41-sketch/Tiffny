# TIFFNY — Student Mess & Tiffin Management Platform

TIFFNY is a web-based platform designed to connect students with mess owners and home-based food providers. It helps students discover mess services, explore meal options, place orders, and choose between eating at a mess and receiving tiffin delivery.

The platform also provides mess owners with tools to manage their services and student orders, while administrators oversee mess registration and platform-related issues.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Objectives](#objectives)
3. [User Roles](#user-roles)
4. [Features](#features)
5. [Project Workflow](#project-workflow)
6. [Technology Stack](#technology-stack)
7. [Project Folder Structure](#project-folder-structure)
8. [Database Design Overview](#database-design-overview)
9. [Backend API Overview](#backend-api-overview)
10. [Installation and Setup](#installation-and-setup)
11. [Running the Application](#running-the-application)
12. [Environment Configuration](#environment-configuration)
13. [Project Status](#project-status)
14. [Future Enhancements](#future-enhancements)
15. [Security Considerations](#security-considerations)

## Project Overview

**Project Name:** TIFFNY  
**Project Type:** Full-Stack Web Application  
**Primary Users:** Students, Mess Owners, and Administrators

Students often face difficulties finding suitable, affordable, and convenient meal services near their colleges, hostels, or accommodation. TIFFNY aims to simplify this process through a single platform where students can discover messes, explore available meal plans, and manage their orders.

Mess owners can register their businesses, maintain mess information, and view student orders. Administrators review mess registrations before approving or rejecting them.

## Objectives

- Connect students with nearby mess services and home-based kitchens.
- Make mess discovery easier through location and address information.
- Support monthly meal plans and one-time meal orders.
- Allow students to choose between eating at the mess and receiving tiffin delivery.
- Help mess owners manage incoming student orders.
- Support student reviews and ratings for mess services.
- Provide a feedback mechanism for reporting platform issues and suggesting improvements.
- Support administrative review of mess registrations and platform feedback.

## User Roles

### 1. Student

Students can register, log in, discover available messes, view mess information, select meal plans, and place orders.

Student capabilities include:

- Student registration and login.
- Browse available and approved messes.
- View mess descriptions, photos, addresses, ratings, and available meal information where implemented.
- Select a monthly meal plan or a one-time meal.
- Choose a meal slot, such as lunch or dinner, where offered.
- Select a meal mode:
  - **EAT_AT_MESS:** Eat at the physical mess location.
  - **TIFFIN:** Receive the meal at the student's delivery address.
- View order confirmation and order history.
- View the active meal plan, where applicable.
- Manage profile information.
- Submit reviews and ratings and platform feedback as those modules are implemented.

### 2. Mess Owner

Mess owners can register their mess and provide the information needed for administrative review.

Expected capabilities include:

- Mess owner registration and login.
- Submit mess information, such as name, description, phone number, address, location, and photo.
- Provide required verification documents when supported by the registration flow.
- Check the mess approval status.
- Manage mess details and meal information.
- View student orders for their mess.
- View student names and phone numbers where authorized.
- View the selected meal, meal slot, plan type, meal mode, price, order status, and relevant location.
- Update order status through the available order-management interface.
- Respond to student reviews and handle assigned issues when those modules are implemented.

### 3. Administrator

The administrator is responsible for platform oversight and mess verification.

Expected capabilities include:

- Review submitted mess registrations.
- Approve or reject mess registrations.
- Help ensure that only approved messes appear in the student discovery experience.
- Review platform feedback.
- Update feedback status and assign relevant issues to mess owners where appropriate.
- Monitor reported content and platform-related issues.

Administrator screens and permissions should be documented as implemented only after their actual functionality is available.

## Features

### Authentication and Profiles

TIFFNY includes registration and login flows for platform users. Protected operations use authentication and role-based authorization.

Profile functionality includes student profile management and password changes.

### Mess Discovery

Students can explore mess information, including available details such as:

- Mess name and description.
- Address and location.
- Mess photo.
- Rating and review information when available.
- Meal and pricing information where configured.

### Meal Plans and Orders

The ordering module supports two plan types:

- **Monthly Plan:** A meal plan for a monthly period. The mess owner determines the applicable price.
- **One-Time Meal:** An order for an individual meal or day, according to the mess's offering.

Each order can contain information such as the mess, student, meal slot, meal name, plan type, meal mode, price, date, location, and status.

### Eat at Mess and Tiffin Delivery

Students are not required to visit the mess for every order. They can choose the available meal mode.

**Eat at Mess**
- The order uses the physical mess address as its location.
- The confirmation should identify this as the mess location.

**Tiffin Delivery**
- The student provides a delivery address.
- The order stores the student's delivery address.
- The confirmation should identify this as the delivery address.

### Order Management

The order-management workflow supports:

- Creating an order.
- Viewing student order history.
- Viewing an active meal plan where applicable.
- Allowing mess owners to view orders associated with their mess.
- Displaying order information and status.
- Updating order status through the owner interface.

### Reviews and Ratings — Planned

The planned reviews module will allow students to rate and review mess services.

Proposed functionality:

- Star ratings from 1 to 5.
- Written reviews.
- Average mess rating and total review count.
- Student review history.
- Mess owner replies to reviews.
- Reporting inappropriate reviews.

The agreed direction allows a registered student to review a mess without requiring a previous order. The exact review editing and deletion rules are still to be finalized before implementation.

### Platform Feedback — Planned

Platform feedback is separate from a public mess review.

Proposed functionality:

- Submit suggestions, technical issues, or general feedback.
- View feedback submitted by the student.
- Track feedback status.
- Allow administrators to review feedback and update its status.
- Assign relevant issues to a mess owner when necessary.
- Allow the assigned owner to respond to the issue.

These review and feedback capabilities should be marked as planned until their implementation is complete.

## Project Workflow

### Student Workflow

1. Open TIFFNY.
2. Register as a student or log in.
3. Browse available messes.
4. Select a mess and inspect its information.
5. Select a meal or meal plan.
6. Choose the meal slot where applicable.
7. Choose Eat at Mess or Tiffin Delivery.
8. Provide a delivery address for a tiffin order.
9. Place the order.
10. View the order confirmation and track the order through the available order interface.

### Mess Owner Workflow

1. Register as a mess owner.
2. Submit the required mess details.
3. Wait for administrative review where approval is required.
4. Access the available owner functionality according to the mess's status.
5. Manage mess and meal information.
6. View student orders.
7. Update order status.
8. Respond to reviews and assigned feedback after those modules are implemented.

### Administrator Workflow

1. Access the administrative interface.
2. Review submitted mess registrations.
3. Approve or reject registrations.
4. Review platform feedback when the feedback module is available.
5. Assign applicable issues to owners.
6. Track issue resolution.

## Technology Stack

### Frontend

- **React** — Component-based user interface.
- **Vite** — Frontend development server and build tooling.
- **JavaScript** — Application programming language.
- **HTML5** — Page structure.
- **CSS3** — Styling and responsive layouts.

### Backend

- **Python** — Backend programming language.
- **FastAPI** — REST API framework.
- **Uvicorn** — ASGI server for running the FastAPI application.
- **Pydantic** — Request and response data validation.
- **PyMongo** — Python driver for MongoDB.
- **JWT-based authentication** — Token-based access to protected endpoints, where configured.
- **Passlib with bcrypt** — Password hashing and verification in the authentication utilities.

### Database

- **MongoDB Atlas** — Cloud-hosted MongoDB database.

The database stores information related to users, messes, orders, menus, and notifications. Additional collections may be introduced as new modules are implemented.

### Development Tools

- Visual Studio Code.
- Node.js and npm.
- Python and pip.
- MongoDB Atlas.
- Git and GitHub.

## Project Folder Structure

The following is a guide to the project's known root structure and the intended organization of its main modules. The exact files in your local project may differ; keep existing files and names when following this guide.

```text
D:\tiffny
│
├── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Student/
│   │   │   ├── Mess/
│   │   │   └── Admin/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── main.py
    ├── auth/
    │   └── auth_utils.py
    ├── routes/
    │   ├── order_routes.py
    │   ├── student_profile_routes.py
    │   ├── review_routes.py       # Planned
    │   └── feedback_routes.py    # Planned
    ├── schemas/
    │   ├── student_profile_schema.py
    │   ├── review_schema.py       # Planned
    │   └── feedback_schema.py    # Planned
    ├── uploads/
    ├── venv/
    └── requirements.txt
```

**Important:** The structure above is illustrative, not a verified listing of every file. Some files and modules shown as planned may not exist yet. Do not create duplicate files just to match this example.

### Frontend Responsibilities

The frontend contains the pages and reusable components users interact with. It sends requests to the backend API and displays returned data.

### Backend Responsibilities

The backend handles API requests, validation, authentication, authorization, business logic, database access, and order processing.

### Database Responsibilities

MongoDB stores the application's persistent data. The backend communicates with the database through PyMongo.

## Database Design Overview

The database name used for TIFFNY is `tiffny_db`.

Known or expected collections include:

| Collection | Purpose |
|---|---|
| `users` | User accounts and role information |
| `messes` | Mess profiles and registration information |
| `orders` | Meal orders, prices, locations, and statuses |
| `menus` | Meal and menu information |
| `notifications` | User notifications, where used |
| `reviews` | Planned student reviews and ratings |
| `feedback` | Planned platform feedback and issue tracking |

The exact field names and constraints should follow the backend schemas and database operations already present in the project.

## Backend API Overview

The backend is built with FastAPI. Available routes should be checked in the actual router files and through the FastAPI documentation.

Known order-related endpoints include:

| Endpoint | Purpose |
|---|---|
| `POST /orders/` | Create an order |
| `GET /orders/my-orders` | Retrieve the student's order history |
| `GET /orders/active-plan` | Retrieve the student's active meal plan |
| `GET /orders/mess-orders` | Retrieve orders for the authenticated mess owner |
| `PUT /orders/status/{order_id}` | Update an order's status |

These endpoints are based on the current known order workflow. Confirm the exact methods and paths in the running application before relying on them.

The API documentation is available at:

`http://127.0.0.1:8000/docs`

## Installation and Setup

### Prerequisites

Install the following tools:

- Python 3.12 or a compatible version used by the backend.
- Node.js and npm.
- Git, if you want to use GitHub.
- A MongoDB Atlas account and database connection string.

### 1. Open the Project

Open the `D:\tiffny` folder in Visual Studio Code.

### 2. Set Up the Backend

Open a terminal and run:

```powershell
cd D:\tiffny\backend
```

If the existing virtual environment is available, activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies if needed:

```powershell
pip install -r requirements.txt
```

If a `requirements.txt` file does not exist yet, install the dependencies used by your project and create one after checking the environment.

### 3. Configure MongoDB Atlas

Create or select your MongoDB Atlas cluster and database. Set the database connection string in the backend environment configuration.

Do not commit your real MongoDB connection string, database password, JWT secret, or other credentials to GitHub.

### 4. Set Up the Frontend

Open a second terminal:

```powershell
cd D:\tiffny\frontend
```

Install frontend dependencies:

```powershell
npm install
```

## Running the Application

### Start the Backend

In the backend terminal:

```powershell
cd D:\tiffny\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

The backend runs at:

`http://127.0.0.1:8000`

Open the interactive API documentation at:

`http://127.0.0.1:8000/docs`

### Start the Frontend

In a separate terminal:

```powershell
cd D:\tiffny\frontend
npm run dev
```

Vite prints the local frontend URL in the terminal. It is commonly:

`http://localhost:5173`

Keep both development servers running while testing the full application.

## Environment Configuration

Use environment variables for secrets and environment-specific settings.

A safe example file could be named `.env.example`:

```env
MONGODB_URI=replace_with_your_mongodb_atlas_connection_string
DATABASE_NAME=tiffny_db
JWT_SECRET_KEY=replace_with_a_long_random_secret
```

This is an example only. Your backend must explicitly read the variables it uses, and the names must match the existing configuration code. Do not overwrite working configuration without checking `main.py` and the database connection module.

Create a private `.env` file for real local values if the project configuration supports it.

Add sensitive files and generated folders to `.gitignore`, including:

```gitignore
.env
.env.*
!.env.example
venv/
__pycache__/
*.py[cod]
node_modules/
dist/
```

Check that no required project files are accidentally ignored before committing.

## Project Status

TIFFNY is being developed in stages.

Known working areas include:

- React/Vite frontend and FastAPI backend development setup.
- MongoDB integration work.
- User authentication and profile-related functionality.
- Student order creation and order history workflows.
- Eat at Mess and Tiffin Delivery location handling.
- Mess owner order management and order status updates.


## Conclusion

TIFFNY aims to make meal discovery and ordering more convenient for students while helping mess owners manage their services digitally. Its modular full-stack architecture supports continued development of ordering, mess management, reviews, ratings, and platform feedback.

The long-term goal is to provide a reliable and user-friendly platform connecting students and mess providers through a single system.