# Backend Seat Reservation System

This repository contains the backend implementation of a Seat Reservation System. It provides APIs for user authentication, seat reservation, and administrative seat management.

---

## 📋 Features

- User Signup and Login
- Token-based Authentication
- Reserve Seats (1–7 seats at a time)
- Cancel Seat Reservation
- Admin Operations (Reset and Initialize Seats)
- Seat Availability with Reservation Details

---

## 🚀 Deployment

This backend is deployed on **OnRender**:

- **Backend**: Hosted on [OnRender](https://train-seat-reservation-backend.onrender.com)
- **Database**: PostgreSQL hosted on OnRender.

Use the provided Base URL to access the APIs:
`https://train-seat-reservation-backend.onrender.com`

---

## 🛠️ Tech Stack

- **Node.js**: Runtime environment for executing JavaScript code on the server.
- **Express.js**: Framework for building RESTful APIs.
- **Sequelize**: ORM for database management.
- **PostgreSQL**: Relational database for storing data.
- **bcrypt.js**: Library for password hashing.
- **jsonwebtoken**: Library for token-based authentication.
- **dotenv**: Library for environment variable management.

---

## ⚙️ Prerequisites

Before running this project, ensure you have:

1. **Node.js** installed on your system.
2. **PostgreSQL** installed and configured.
3. A `.env` file with the following keys:
   ```env
   JWT_SECRET=your_jwt_secret_key
   DATABASE_HOST=localhost
   PORT=3000
   DATABASE_URL=your_db_string
   ```

## 📄 Models

### User Model

| Field    | Type   | Constraints                 |
| -------- | ------ | --------------------------- |
| username | STRING | Required                    |
| email    | STRING | Required, Unique, Validated |
| password | STRING | Required, Hashed            |
| role     | ENUM   | "admin", "user" (default)   |

### Seat Model

| Field       | Type    | Constraints          |
| ----------- | ------- | -------------------- |
| row         | INTEGER | Required             |
| seat_number | INTEGER | Required             |
| reserved_by | INTEGER | FK to User, Nullable |

## 🚀 How to Run the Project

- Clone this repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

- Install dependencies:

```bash
npm install
```

- Setup the PostgreSQL database and update the .env file with your database credentials.

- Initialize the database
- Start the server:

```bash
node index.js
```

- Access the APIs on http://localhost:3000.

## 🛠️ Workflow

1. Users sign up and log in to the system.
2. Authenticated users can:
   - View all seats.
   - Reserve 1–7 seats at a time.
   - Cancel their reservations.
3. Admin users can:
   - Initialize seats in the database.
   - Reset all reservations.

## 🔗 Endpoints

### User Authentication

### **Signup**

- **Endpoint**: `POST api/users/signup`
- **Description**: Create a new user account.
- **Request Body**:
  ```json
  {
    "username": "example",
    "email": "example@example.com",
    "password": "securepassword",
    "role": "user"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": 1,
    "username": "example",
    "email": "example@example.com",
    "role": "user"
  }
  ```

### **Login**

- **Endpoint**: `POST api/users/login`
- **Description**: Login a user and generate a JWT token.
- **Request Body**:
  ```json
  {
    "username": "example",
    "email": "example@example.com",
    "password": "securepassword",
    "role": "user"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": 1,
    "username": "example",
    "email": "example@example.com",
    "role": "user"
  }
  ```

### Seat Management

### **Get All Seats**

- **Endpoint**: `GET api/seat/all`
- **Description**: Fetch all seat details along with unreserved seat count.
- **Response Body**:
  ```json
  {
  "seats": [...],
  "unreservedSeatsCount": 10
  }
  ```

### **Reserve Seats**

- **Endpoint**: `POST api/seat/reserve`
- **Description**: Reserve 1–7 seats for the logged-in user.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:

  ```json
  {
    "seatCount": 3
  }
  ```

- **Response Body**:
  ```json
  [
  {
    "id": 1,
    "row": 1,
    "seat_number": 1,
    "reserved_by": 1
  },
  ...
  ]
  ```

### **Initialize Seats (Admin Only)**

- **Endpoint**: `POST api/seat/initialisation`
- **Description**: Initialize seats in the database.
- **Headers**: `Authorization: Bearer <admin_token>`

- **Response Body**:
  ```json
  {
    "message": "Seats initialized successfully."
  }
  ```

### **Reset All Seats (Admin Only)**

- **Endpoint**: `POST api/seat/reset`
- **Description**: Reset all seat reservations.
- **Headers**: `Authorization: Bearer <admin_token>`

- **Response Body**:
  ```json
  {
    "message": "All seats have been reset."
  }
  ```

## 📝 Notes

- Ensure the database is correctly set up before running the server.
- Use the admin role for administrative endpoint. (`reset`, `initialisation`).

## 🧑‍💻 Author

Bhavuk Mittal, `vvbnmittal@gmail.com`
