# Recruitment Pipeline Interface

This project is a recruitment tracking system built with **React** (frontend), **Spring Boot** (backend), and **PostgreSQL** (database). It enables users to manage candidate pipelines, conduct assessments, and handle referrals through a Kanban-style interface.

---

## 🛠️ Technologies Used

- **Frontend**: React  
- **Backend**: Spring Boot  
- **Database**: PostgreSQL

---

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Limesh-B/Recruitment-pipeline-API.git
cd Recruitment-pipeline-API
```

### 2. Backend Setup

#### a. Navigate to the API folder
Select the root folder or else .env file might not get loaded.
```bash
cd Recruitment-pipeline-API
```

#### b. Create a `.env` file
Create a `.env` file in the `Recruitment-pipeline-API` directory with your PostgreSQL credentials:

```env
DB_URL=jdbc:postgresql://localhost:5432/recruitment_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### c. Run the backend
Make sure PostgreSQL database is created and running, then start the backend:

```bash
./mvnw spring-boot:run
```

Or use your IDE (e.g., IntelliJ, Eclipse) to run the application.

---

### 3. Frontend Setup

#### a. Navigate to the client directory
```bash
cd client
```

#### b. Install dependencies
```bash
npm install
```

#### c. Start the development server
```bash
npm run dev
```

---

## 🌐 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/candidates` | Create a new candidate |
| GET    | `/api/candidates` | Get all candidates |
| GET    | `/api/candidates/{id}` | Get candidate by ID |
| GET    | `/api/candidates/search?name={name}` | Get candidate by name |
| GET    | `/api/candidates/stage/{stage}` | Filter candidates by stage |
| PUT    | `/api/candidates/{id}` | Update a candidate |
| PATCH  | `/api/candidates/{id}/stage` | Update candidate's stage (drag-and-drop) |
| DELETE | `/api/candidates/{id}` | Delete a candidate |

### Paginated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/candidates/paginated` | Get all candidates with pagination and sorting |
| GET    | `/api/candidates/stage/{stage}/paginated` | Get candidates by stage with pagination and sorting |

### Pagination & Sorting Query Parameters

Both paginated endpoints accept the following query parameters:

| Parameter   | Description                             | Example                 |
|-------------|-----------------------------------------|-------------------------|
| `page`      | Page number (0-indexed)                 | `page=0`                |
| `size`      | Number of candidates per page           | `size=5`                |
| `sortBy`    | Field to sort by                        | `sortBy=name`           |
| `direction` | Sort direction: `asc` or `desc`         | `direction=desc`        |

#### 🧪 Example Request
```http
GET /api/candidates/paginated?page=0&size=5&sortBy=name&direction=desc
```

---

## 📝 Notes

### 💡 Assumptions

- Since candidate ID is not shown in the Kanban view, only **filter by name** is implemented in the frontend. However, the backend still supports filtering by ID.
- It is assumed that the user is comfortable running both frontend and backend apps locally.

### ⚙️ Decisions Made

- A new endpoint `/api/candidates/search?name={name}` was created to support name-based candidate search.
- Advanced filtering is disabled in the client UI since **filtering by date, score, and name** is already available.

---

## ✋ How to Manually Refer Candidates

To manually refer candidates:

1. Click the **"Refer People"** button.
2. Click one or more **candidate cards** to select them.
3. Click **"Confirm Referrals"** to mark them as referred.

---

## ⚠️ Limitations

- Backend supports pagination, but **pagination is not yet implemented in the frontend**.
