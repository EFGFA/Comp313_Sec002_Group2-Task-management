# Task Management Application (Comp313 Sec002 Group2)

## Project Overview

This project is a web-based task management application developed by **Comp313 - Section 002 - Group 2**. It's designed to help teams manage their work efficiently by allowing users to create, assign, track, and complete tasks while maintaining transparency. The system features user authentication, role-based access control (as defined in the model), task status updates, and a RESTful API.

## Project Structure

The project is organized into two main directories:

- `COMP313-backend-main/`: Contains the Node.js/Express backend server code.
- `comp313-frontend-main/`: Contains the React frontend client code.

_(Refer to each directory for detailed structure)_

## Key Features

- **User Authentication**: Secure registration, login, and logout using JSON Web Tokens (JWT).
- **Role-Based Access Control**:
  - User model defines `admin` and `user` roles. (Note: Strict route-level enforcement based on roles might require further implementation in controllers/routes beyond basic authentication).
  - Admins are expected to have additional privileges like user management and potentially task assignment oversight.
- **Task Management (CRUD)**:
  - Create new tasks (including Title, Description, Due Date, Status, Assigned User).
  - Read list of tasks and individual task details.
  - Update task information.
  - **Task Status Updates**: Modify task status ('Pending', 'In Progress', 'Completed') via the update endpoint.
  - Delete tasks.
- **User Management**: Add new users (frontend `AddUserPage.jsx` exists, likely intended as an admin feature).
- **RESTful API**: Backend API built with Node.js and Express.js following REST principles.

## Tech Stack

**Backend**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs (Password Hashing)
- **Middleware:** Cors, Express built-in middleware
- **Environment Variables:** dotenv
- **Testing:** Jest
- **Development:** nodemon

**Frontend**

- **Library:** React
- **Routing:** React Router (`react-router-dom`)
- **HTTP Client:** Axios
- **State Management:** React Context API (`AuthContext`)
- **Styling:** CSS
- **Utilities:** jwt-decode

## Middleware & Authentication

The `protect` middleware (`COMP313-backend-main/middleware/auth.js`) secures specific routes. It verifies a JWT token sent in the `Authorization` header of incoming requests (e.g., `Authorization: Bearer <token>`). Only requests with a valid token can access protected resources.

## API Endpoints (Backend)

The backend API base path is `/api`.

### Authentication

| Method | Endpoint          | Description                      |
| :----- | :---------------- | :------------------------------- |
| POST   | `/users/register` | Register a new user              |
| POST   | `/users/login`    | Login user and receive JWT token |

### Users

| Method | Endpoint     | Description   | Notes                       |
| :----- | :----------- | :------------ | :-------------------------- |
| GET    | `/employees` | Get all users | Auth required; Likely Admin |

### Tasks

| Method | Endpoint            | Description                  | Notes                                       |
| :----- | :------------------ | :--------------------------- | :------------------------------------------ |
| POST   | `/tasks`            | Create a new task            | Auth required                               |
| GET    | `/tasks`            | Get all tasks                | Auth required                               |
| GET    | `/tasks/:id`        | Get a specific task by ID    | Auth required                               |
| PUT    | `/tasks/:id`        | Update a specific task by ID | Auth required;                              |
| PUT    | `/tasks/:id/status` | Update a specific task by ID | Auth required; Used for status updates etc. |
| DELETE | `/tasks/:id`        | Delete a specific task by ID | Auth required                               |

_Note: Task assignment seems handled via the `assignedUser` field during task creation or update (PUT `/tasks/:id`), rather than a dedicated assignment endpoint found in the current routes._

## Setup and Installation

### Prerequisites

- Node.js (v14 or later recommended) & npm
- MongoDB (local instance or cloud service like MongoDB Atlas)

### Steps

1.  **Clone the Repository**

    ```bash
    git clone <repository-url> # Replace <repository-url> with the actual URL
    cd Comp313_Sec002_Group2-Task-management-1
    ```

2.  **Setup and Run Backend Server**

    ```bash
    # Navigate to the backend directory
    cd COMP313-backend-main

    # Install backend dependencies
    npm install

    # Create a .env file in the COMP313-backend-main directory
    # Use .env.example as a template or create it manually.
    # Update the variables with your settings:
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string # Replace with your actual MongoDB connection string
    JWT_SECRET=your_strong_jwt_secret_key    # Replace with a strong, unique secret key

    # Run the backend development server (with auto-restart)
    npm run dev

    # Alternatively, run the production server: npm start
    ```

    - The backend server will run on the port specified in your `.env` file (default is `http://localhost:5000`).
    - Keep this terminal running.

3.  **Setup and Run Frontend Application**

    ```bash
    # Open a NEW terminal window/tab
    # Navigate back to the project root directory first (if you are in the backend folder)
    # cd ..
    # Or navigate directly from the root: cd comp313-frontend-main

    # Navigate to the frontend directory
    cd comp313-frontend-main

    # Install frontend dependencies
    npm install

    # Run the frontend development server
    npm start
    ```

    - The frontend development server will typically open automatically in your browser at `http://localhost:3000`.
    - **Important:** The frontend (`src/api.js`) is configured to communicate with the backend at `http://localhost:5000/api`. If your backend runs on a different port, update the `baseURL` in `comp313-frontend-main/src/api.js`.

4.  **Access the Application**

    Open your web browser and go to `http://localhost:3000` (or the address provided when you started the frontend).

## Contributing

Contributions are welcome! Please feel free to submit pull requests. Ensure your changes adhere to best practices and include tests where applicable.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## Contributors

- Comp313 Sec002 Group 2
