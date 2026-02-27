# Squad Server Manager Panel (SQFY)

A modern, web-based management panel for Squad game servers. Built with React, Node.js, and Docker.

## 🚀 Features

*   **Server Management**: Add, edit, and monitor multiple Squad servers via RCON.
*   **Real-time Dashboard**: Visualize online players, server status, and admin activity.
*   **Player Management**: View player lists, kick/ban players, and view history.
*   **RCON Terminal**: Execute raw RCON commands directly from the browser.
*   **Config Editor**: Edit `Server.cfg`, `Admins.cfg`, and other config files via local file system or SFTP.
*   **Log Analysis**: Search and filter chat logs, kill logs, and admin activity logs.
*   **Team System**: Manage clans/teams and members.
*   **Admin Attendance**: Track admin duty time with check-in/check-out system.
*   **Plugin System**: Extend functionality with custom JavaScript plugins.
*   **Role-Based Access**: Granular permissions for Superadmins, Admins, and Observers.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite, Ant Design, Recharts, TailwindCSS.
*   **Backend**: Node.js, Express, TypeScript, Socket.io.
*   **Database**: SQLite (default) or PostgreSQL, managed by Prisma ORM.
*   **Deployment**: Docker & Docker Compose.

## 📦 Quick Start (Docker)

The easiest way to run the panel is using Docker.

### Prerequisites
*   Docker and Docker Compose installed.

### Installation

1.  **Clone the repository** (or download the source code).
2.  **Run the deployment script**:

    **Linux/Mac**:
    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

    **Windows**:
    Double-click `start.bat` or run in CMD:
    ```cmd
    start.bat
    ```

    The script will:
    *   Check for Docker installation.
    *   Create a `.env` file from `.env.example` if missing.
    *   Generate a secure JWT secret.
    *   Build and start the containers.

3.  **Access the Panel**:
    Open your browser and navigate to `http://localhost` (or your server's IP).

4.  **Initial Setup**:
    *   Register a new account. **The first registered user will automatically become the Superadmin.**
    *   Go to "Server Management" and add your Squad server details (Host, RCON Port, Password).

## 🔧 Manual Development Setup

If you want to contribute or run without Docker:

### Prerequisites
*   Node.js (v18+)
*   npm

### Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    cd client && npm install
    cd ../server && npm install
    ```

2.  **Database Setup**:
    ```bash
    cd server
    npx prisma migrate dev
    ```

3.  **Start Backend**:
    ```bash
    cd server
    npm run dev
    # Runs on http://localhost:3000
    ```

4.  **Start Frontend**:
    ```bash
    cd client
    npm run dev
    # Runs on http://localhost:5173
    ```

## 📝 Configuration

The application is configured via the `.env` file in the root directory.

| Variable | Description | Default |
|Or|---|---|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT tokens | (Randomly generated) |
| `PORT` | Backend server port | `3000` |
| `VITE_API_URL` | Frontend API URL (for dev) | `/api` |

## 🔌 Plugins

Plugins are located in the `plugins/` directory. Each plugin is a folder containing a `manifest.json` and an entry point (e.g., `index.js`).

Example structure:
```
plugins/
  my-plugin/
    manifest.json
    index.js
```

See `plugins/example-plugin` for a reference implementation.

## 📄 License

MIT License
