# 🏫 Smart Campus Complaint & Maintenance Management System

A full stack web application where **students** raise complaints about campus problems (electrical, plumbing, network, cleaning, furniture), the **admin** assigns them to **maintenance staff**, and staff update the work status until the problem is resolved.

**Tech Stack**

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (JSON Web Token) + bcryptjs |

---

## 1. How to Run in VS Code

### Requirements (install once)
1. **Node.js** (v18 or above) – https://nodejs.org
2. **MongoDB Community Server** – https://www.mongodb.com/try/download/community
   (or use a free **MongoDB Atlas** cloud database and paste its URL in `backend/.env`)
3. **VS Code** – optional extension: *MongoDB for VS Code* / MongoDB Compass to view data

### Steps
1. Open the `smart-campus` folder in VS Code (**File → Open Folder**).
2. Open a terminal (**Terminal → New Terminal**) and start the backend:
   ```bash
   cd backend
   npm install
   npm run seed      # adds sample users and complaints (run only once)
   npm run dev       # starts server at http://localhost:5000
   ```
3. Open a **second terminal** (click the **+** in the terminal panel) and start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev       # opens app at http://localhost:3000
   ```
4. Open **http://localhost:3000** in your browser.

### Login Accounts (after running seed)
| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | admin123 |
| Staff | staff@campus.edu | staff123 |
| Student | student@campus.edu | student123 |

> Even without running seed, the server automatically creates the admin account on first start. Students can register from the Register page.

### Common Problems
| Problem | Solution |
|---|---|
| `MongoDB connection failed` | Make sure MongoDB service is running, or check `MONGO_URI` in `backend/.env` |
| "Cannot connect to server" on login page | Backend is not running – start it with `npm run dev` in `backend` |
| Port already in use | Change `PORT` in `backend/.env` and the proxy in `frontend/vite.config.js` |

---

## 2. Project Architecture

```
 ┌─────────────────────────┐        REST API (JSON)        ┌──────────────────────────┐      Mongoose      ┌──────────────┐
 │   React.js Frontend     │  ───────────────────────────▶ │  Node.js + Express.js    │ ─────────────────▶ │   MongoDB    │
 │   (localhost:3000)      │   GET / POST / PUT / DELETE   │  Backend (localhost:5000)│                    │              │
 │                         │  ◀─────────────────────────── │                          │ ◀───────────────── │  users       │
 │ Pages, Components,      │      JSON response            │ Routes → Middleware →    │                    │  complaints  │
 │ Axios, Context (auth)   │   (JWT token in header)       │ Controllers → Models     │                    │              │
 └─────────────────────────┘                               └──────────────────────────┘                    └──────────────┘
```

**Example flow – Student raises a complaint**
1. Student fills the form in `ComplaintForm.jsx` → React validates fields.
2. Axios sends `POST /api/complaints` with the JWT token.
3. Express → `protect` middleware checks the token → `allowRoles("student")` checks role.
4. `createComplaint` controller validates data and calls `Complaint.create()`.
5. MongoDB saves the document → backend returns `201 Created` with JSON.
6. React shows a success message and goes back to the dashboard.

---

## 3. Folder Structure

```
smart-campus/
├── backend/
│   ├── config/db.js                  # MongoDB connection
│   ├── models/User.js                # User schema
│   ├── models/Complaint.js           # Complaint schema (with comments)
│   ├── controllers/authController.js
│   ├── controllers/complaintController.js
│   ├── controllers/userController.js
│   ├── routes/authRoutes.js
│   ├── routes/complaintRoutes.js
│   ├── routes/userRoutes.js
│   ├── middleware/authMiddleware.js  # JWT check + role check
│   ├── middleware/errorMiddleware.js # 404 + error handler
│   ├── seed.js                       # sample data
│   ├── server.js                     # entry point
│   └── .env
└── frontend/
    ├── index.html
    ├── vite.config.js                # proxy /api → backend
    └── src/
        ├── main.jsx
        ├── App.jsx                   # routes
        ├── index.css
        ├── services/api.js           # all API calls (Axios)
        ├── context/AuthContext.jsx   # login state
        ├── components/Navbar.jsx
        ├── components/ComplaintCard.jsx
        ├── components/ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── ComplaintForm.jsx     # add + edit
            ├── ComplaintDetails.jsx
            └── ManageUsers.jsx
```

---

## 4. Database Design (MongoDB)

### Collection: `users`
| Field | Type | Details |
|---|---|---|
| _id | ObjectId | Primary key (auto) |
| name | String | required |
| email | String | required, unique |
| password | String | required, stored as bcrypt hash |
| role | String | `student` / `staff` / `admin` |
| department | String | CSE / ECE / EEE / Mechanical / Civil / IT / MBA / Other |
| employeeId | String | unique, for staff and admin (e.g. EMP001) |
| jobRole | String | Electrician / Plumber / Network Technician / Housekeeping / Carpenter / General |
| employmentStatus | String | `present` or `past` (past employees stay in DB, cannot login) |
| createdAt, updatedAt | Date | auto (timestamps) |

### Collection: `complaints`
| Field | Type | Details |
|---|---|---|
| _id | ObjectId | Primary key (auto) |
| title | String | required, min 3 chars |
| description | String | required, min 10 chars |
| category | String | Electrical / Plumbing / Network / Cleaning / Furniture / Other |
| block | String | Block A / Block B / Block C / Block D |
| roomNumber | String | required |
| location | String | auto saved as "Block A - Room 204" |
| status | String | Pending / In Progress / Resolved / Rejected (default Pending) |
| createdBy | ObjectId → users | student who raised it |
| assignedTo | ObjectId → users | staff member (null if not assigned) |
| comments | Array | `{ user: ObjectId → users, text, createdAt }` |
| createdAt, updatedAt | Date | auto (timestamps) |

### Relationships
- One **student** → many **complaints** (`createdBy`)
- One **staff** → many assigned **complaints** (`assignedTo`)
- One **complaint** → many **comments** (embedded array)

---

## 5. REST API Details

Base URL: `http://localhost:5000/api`
Protected routes need the header: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/register | Public | Register a new student |
| POST | /auth/login | Public | Login and get token |
| GET | /auth/profile | Logged in | Get logged in user details |

### Complaints
| Method | Endpoint | Access | Description | CRUD |
|---|---|---|---|---|
| GET | /complaints | Logged in | Get complaints (student: own, staff: assigned, admin: all). Filters: `?status=&category=&search=` | Read |
| GET | /complaints/stats | Logged in | Count of complaints by status | Read |
| GET | /complaints/:id | Logged in | Get one complaint | Read |
| POST | /complaints | Student | Create complaint | Create |
| PUT | /complaints/:id | Student / Staff / Admin | Student edits pending complaint, admin assigns staff & changes status, staff updates status | Update |
| DELETE | /complaints/:id | Student (own pending) / Admin | Delete complaint | Delete |
| POST | /complaints/:id/comments | Logged in | Add a comment | Create |

### Users (Admin only)
| Method | Endpoint | Description | CRUD |
|---|---|---|---|
| GET | /users?role=staff | Get all users (optional role filter) | Read |
| POST | /users | Add staff / admin / student | Create |
| DELETE | /users/:id | Delete a user | Delete |

### Sample Request & Response
`POST /api/complaints`
```json
{
  "title": "Fan not working",
  "description": "The ceiling fan in room 204 is not working",
  "category": "Electrical",
  "location": "Block A - Room 204"
}
```
Response `201 Created`
```json
{
  "_id": "66a1...",
  "title": "Fan not working",
  "status": "Pending",
  "createdBy": "66a0...",
  "assignedTo": null,
  "comments": [],
  "createdAt": "2026-..."
}
```

### Error Responses
All errors are returned as `{ "message": "..." }`
| Code | Meaning | Example |
|---|---|---|
| 400 | Bad request / validation error | "Title must be at least 3 characters" |
| 401 | Not logged in / wrong token | "Not authorized, please login" |
| 403 | Not allowed for this role | "You are not allowed to do this" |
| 404 | Not found | "Complaint not found" |
| 500 | Server error | "Server error, please try again" |

---

## 6. Validation & Error Handling

**Frontend (React)**
- Required field checks, minimum length, email format, password match on register
- Error messages from the backend shown in red boxes, success messages in green
- Buttons disabled while loading, confirm popup before delete
- Protected routes – pages open only for logged in users with the correct role

**Backend (Express)**
- Each controller validates input before saving
- Mongoose schema validation (required, enum, minlength, unique)
- `authMiddleware` – checks JWT token and user role
- `errorMiddleware` – handles 404 routes, validation errors, invalid IDs and duplicate emails in one place

---

## 7. Features by Role

| Student | Staff | Admin |
|---|---|---|
| Register / Login | Login | Login |
| Raise complaint | View assigned complaints | View all complaints |
| Edit / delete pending complaint | Mark "In Progress" / "Resolved" | Assign staff to complaints |
| Track status (progress bar) | Comment on complaint | Change status (incl. Reject) |
| Comment on complaint | | Delete any complaint |
| Dashboard with stats & filters | Dashboard with stats & filters | Add / delete users |

---

## 8. Team Roles & Contributions

| Member | Role | Contribution |
|---|---|---|
| Member 1 – ________ | React Frontend Development | Designed all pages (Login, Register, Dashboard, Complaint Form, Details, Manage Users), components, routing and CSS styling |
| Member 2 – ________ | Node.js + Express Backend & APIs | Created Express server, routes, controllers, REST APIs for complaints and users, error handling middleware |
| Member 3 – ________ | MongoDB & Database | Designed database schemas (User, Complaint), relationships, Mongoose models, seed data, filters & stats queries |
| Member 4 – ________ | Authentication, Integration & Testing | JWT login, password hashing, role-based access, connected frontend to backend using Axios, tested APIs using Postman |

---

## 9. Screenshots

Add screenshots in a `screenshots/` folder:
1. Login page
2. Register page
3. Student dashboard
4. Raise complaint form
5. Complaint details with progress bar & comments
6. Admin – assign staff & change status
7. Staff – update status
8. Admin – manage users
9. MongoDB Compass showing `users` and `complaints` collections

---

