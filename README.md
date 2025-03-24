# Task Management System

## Introduction
The **Task Management System** is a web-based application designed to help small teams manage their work efficiently. It allows users to create, assign, track, and complete tasks while maintaining transparency within the team. The system features user authentication, role-based access, task status updates, and notifications.

## Features
- **User Authentication**: Secure login and registration with JWT authentication.
- **Role-Based Access**: Admins can assign tasks, while users can manage their assigned tasks.
- **Task Management**:
  - Create new tasks
  - Update task status (e.g., "Not Started", "In Progress", "Completed")
  - Delete tasks if necessary
- **Notifications**: Alerts for upcoming deadlines and task status changes.
- **Task Assignment**: Admins can assign tasks to specific users.
- **RESTful API**: Built with Node.js and Express.js, following REST principles.

## Technologies Used
- **Frontend**: React.js (not included in this repo, but expected integration)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **Middleware**: Express & cookie-parser for handling requests

## Installation
### Prerequisites
Ensure you have the following installed on your system:
- Node.js (v14+)
- MongoDB (local or Atlas)

### Steps to Install
1. Clone the repository:
   ```sh
   git clone https://github.com/EFGFA/Comp313_Project2
   cd Comp313_Project2
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=8082
   MONGO_URI="mongodb://localhost/sof_server"
   JWT_SECRET=your-secret-key
   ```
4. Start the server:
   ```sh
   npm start
   ```
   The server should now be running on `http://localhost:8082/`

## API Endpoints
### Authentication
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| POST   | `/api/register` | Register a new user |
| POST   | `/api/login`    | Login user and receive JWT token |

### Task Management
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | `/api/tasks`         | Create a new task (Protected) |
| GET    | `/api/tasks`         | Get all tasks |
| PUT    | `/api/tasks/:id/status` | Update task status (Protected) |
| DELETE | `/api/tasks/:id`     | Delete a task (Protected) |
| PUT    | `/api/tasks/assign`  | Assign a user to a task (Admin only) |

## Middleware & Authentication
The `protect` middleware ensures that only authenticated users can access certain routes. It checks for a JWT token in the **Authorization header (Bearer Token)** or **cookies**.

## Contributing
Feel free to contribute to this project by submitting pull requests. Ensure your changes follow best practices and include necessary tests.
