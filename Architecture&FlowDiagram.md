SMART CAMPUS - ARCHITECTURE AND FLOW

1. PROJECT OVERVIEW

Smart Campus Complaint and Maintenance Management System allows students to report maintenance problems on campus. An admin reviews complaints and assigns them to present maintenance staff. Staff update the work status, and students can track the result.

The system also stores present and past employees. Each employee has a unique Employee ID and a job role, such as Electrician or Plumber. When an employee leaves, their completed work remains linked to their record in the database.

Technology stack:
React.js frontend -> Node.js + Express.js backend -> MongoDB database


2. SYSTEM ARCHITECTURE

Student / Staff / Admin
          |
          v
React frontend (localhost:3000)
Pages, forms, dashboard, React Router and AuthContext
          |
          v
Axios sends HTTP requests and receives JSON
          |
          v
Express REST API (localhost:5000)
Routes -> JWT and role middleware -> Controllers -> Mongoose models
          |
          v
MongoDB database: smart_campus
Collections: users and complaints

React does not connect directly to MongoDB. It calls the Express REST APIs. Express uses Mongoose to read and write MongoDB documents.

During development, Vite runs React on port 3000 and forwards requests beginning with /api to Express on port 5000. The backend reads the MongoDB connection string from its .env file.

What each part does:

React: Displays pages, forms, complaint cards, status counts and staff details.

Axios: Sends requests from React to Express. It adds the login token to protected requests.

Express: Receives requests, checks authentication and roles, validates data and applies the project rules.

Mongoose: Defines the User and Complaint schemas and performs database operations.

MongoDB: Stores user records, employee records, complaints and comments.


3. COMPLAINT FLOW

Step 1 - Login

A student enters an email and password in the React login page. React sends POST /api/auth/login to Express. Express finds the user in MongoDB and compares the entered password with the stored bcrypt hash.

If the password is correct, Express returns a JWT token and user details. React stores them so the student can make protected API requests.

Step 2 - Raise a complaint

The student fills in:
- Title
- Description
- Category, such as Electrical or Plumbing
- Block A, B, C or D from a dropdown
- Room number in a separate field

React checks the required fields. Axios sends POST /api/complaints with the JWT token.

Step 3 - Backend validation and storage

The Express middleware verifies the token and confirms that the user is a student. The controller validates the complaint details again.

Mongoose saves the complaint in MongoDB. The block and room number are stored separately. A display location such as "Block A - Room 204" is generated from them.

A new complaint starts with the status Pending. Express returns a 201 Created response.

Step 4 - Admin assignment

The admin opens the complaint and selects a PRESENT staff member. The dropdown shows their name, job role and Employee ID, for example:

Ravi Kumar - Electrician (EMP001)

React sends PUT /api/complaints/:id. Express checks that the selected user is staff and is not a past employee. It saves the assignment in MongoDB. If the complaint was Pending, its status becomes In Progress.

Step 5 - Staff completes the work

The assigned staff member logs in and sees assigned jobs on their dashboard. After doing the repair, the staff member marks the complaint Resolved. Express updates the complaint in MongoDB.

Step 6 - Student tracks the result

The student opens the dashboard or complaint details page. React requests the latest complaint information from Express. The student can see the updated status and the assigned employee.

Step 7 - Comments

A logged-in user can add a comment through POST /api/complaints/:id/comments. The comment is saved inside the complaint document. The detail page displays the comment thread.

Example:

A student reports a broken fan in Block A, Room 204. The admin assigns Ravi Kumar, Electrician (EMP001). Ravi repairs the fan and marks the complaint Resolved. The student sees the new status on the dashboard.


4. COMPLAINT STATUS FLOW

Pending -> In Progress -> Resolved

Pending: The student has submitted the complaint, but work has not started.

In Progress: The admin has assigned staff, or the assigned staff is working on it.

Resolved: The work has been completed.

Rejected: The admin has rejected the complaint.

A student can edit or delete their own complaint only while it is Pending. The admin can also change a complaint's status manually.


5. PRESENT STAFF AND PAST EMPLOYEE FLOW

Every staff member has:
- A unique Employee ID, such as EMP001
- A job role, such as Electrician, Plumber or Network Technician
- An employment status: present or past

Present staff can log in and receive new assignments.

When an employee leaves, the admin marks their employment status as past rather than deleting their record. A past employee cannot log in and cannot receive new assignments.

If that employee had unfinished jobs, those jobs become unassigned and Pending so the admin can give them to someone else.

Resolved complaints remain linked to the past employee. The complaint's assignedTo field stores a reference to the employee's MongoDB user record. That record contains their readable Employee ID, name and job role.

In Manage Staff, the admin can select the Past Employees tab, click an employee card and view their completed work.

Example past employees in the sample database:

EMP010 - Mohan Das - Electrician - Corridor lights replaced
EMP011 - Lakshmi - Housekeeping - Hostel cleaning drive
EMP012 - Joseph - Plumber - Main tank pipe repaired

The admin can add more staff in the future. The Add Staff form suggests an Employee ID after the highest existing ID, and the backend checks that the ID is unique.

IMPORTANT: The sample seed script deletes and recreates demo data. Run npm run seed only when you want to reset the database.


6. DATABASE DESIGN

MongoDB has two main collections.

USERS COLLECTION

_id: MongoDB's internal ObjectId
name: User's name
email: Unique login email
password: Bcrypt-hashed password
role: student, staff or admin
department: Academic or organisational department, if provided
employeeId: Unique readable ID for staff/admin, for example EMP001
jobRole: Electrician, Plumber, Network Technician, etc.
employmentStatus: present or past
createdAt, updatedAt: Automatic timestamps

COMPLAINTS COLLECTION

_id: Complaint's MongoDB ObjectId
title: Short description of the problem
description: Detailed explanation
category: Electrical, Plumbing, Network, Cleaning, Furniture or Other
block: Block A, Block B, Block C or Block D
roomNumber: Separate room number field
location: Display text built from block and room number
status: Pending, In Progress, Resolved or Rejected
createdBy: Reference to the student in users
assignedTo: Reference to the staff member in users, or null
comments: Array of comments with user, text and date
createdAt, updatedAt: Automatic timestamps

Comments are embedded inside complaint documents; they are not a separate MongoDB collection.

Mongoose populate() retrieves details from referenced users. For example, assignedTo stores an ObjectId, and populate() lets the interface display the staff member's name, Employee ID and job role.

MongoDB _id and Employee ID are different. The _id is used internally to link documents. The Employee ID, such as EMP001, is the readable number shown to the admin.


7. MAIN REST APIS AND CRUD

Authentication:
POST   /api/auth/register             Register a student
POST   /api/auth/login                Log in and receive a JWT

Complaints:
GET    /api/complaints                Read the role-appropriate complaint list
GET    /api/complaints/:id            Read one complaint
GET    /api/complaints/stats          Read dashboard status counts
POST   /api/complaints                Create a complaint
PUT    /api/complaints/:id            Edit, assign or change status
DELETE /api/complaints/:id            Delete a permitted complaint
POST   /api/complaints/:id/comments   Add a comment

Staff and users (admin only):
GET    /api/users                     View users; filter present/past staff
GET    /api/users/next-id             Suggest the next Employee ID
POST   /api/users                     Add a staff member
PUT    /api/users/:id                 Change employment status
GET    /api/users/:id/work            View an employee's work history
DELETE /api/users/:id                 Delete a permitted user

CRUD means:
Create = POST
Read   = GET
Update = PUT
Delete = DELETE


8. AUTHENTICATION, VALIDATION AND ERROR HANDLING

Passwords are hashed with bcrypt before being stored in MongoDB.

A successful login returns a JWT. React includes it in protected requests as a Bearer token. Express middleware checks the token and the user's role.

The frontend validates forms to give quick feedback. The backend validates again because a user could call an API directly without using the frontend. Mongoose schemas also restrict fields such as block, category, status and job role to valid values.

Common API response codes:

400 - Missing or invalid input
401 - Missing or invalid login token
403 - Logged in but not allowed to perform the action
404 - Record or route not found
500 - Unexpected server error

Errors are returned as JSON messages, which React displays to the user.

OVERALL FLOW TO REMEMBER:

React UI
   -> Axios request
   -> Express route
   -> Authentication and role middleware
   -> Controller validation and business rules
   -> Mongoose model
   -> MongoDB
   -> JSON response
   -> React updates the screen
