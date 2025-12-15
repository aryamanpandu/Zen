# Zen — A Pomodoro Timer App

Zen is a minimalist Pomodoro timer application built with **Express.js** (backend) and **React + Vite + Tailwind CSS** (frontend). The app helps users stay focused on their work by breaking time into focused intervals with short and long breaks.

## Features

- **User Authentication**: Register and login with secure JWT-based authentication
- **Custom Configurations**: Create and manage multiple Pomodoro timer configurations with custom focus, short break, and long break durations
- **Immutable Default Config**: A built-in default configuration (25 min focus / 5 min short break / 15 min long break / 4 sessions) that cannot be modified or deleted
- **Session Timer**: Full-screen, distraction-free timer with circular progress indicator
- **Focus Tracking**: Track what you're working on with a simple focus input field
- **Audio Notifications**: Web Audio API generates unique beep sounds for session transitions
- **Responsive Design**: Clean, modern UI with glassmorphism effects and smooth animations
- **Professional UI**: Gradient backgrounds, smooth transitions, and minimalist design for a zen-like experience

## Tech Stack

**Backend:**
- Node.js + Express.js
- JWT authentication with bcryptjs for password hashing
- JSON file storage (`storage.json`) for user data, configs, and sessions
- CORS enabled for frontend communication

**Frontend:**
- React 18 with React Router for navigation
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- Material UI Icons for professional iconography
- @emotion/react and @emotion/styled for advanced styling

## Project Structure

```
Zen/
├── server/                    # Express backend
│   ├── index.js              # Main API server with all endpoints
│   ├── storage.json          # JSON database with users, configs, sessions
│   └── package.json          # Backend dependencies
│
└── client/                    # React frontend
    ├── src/
    │   ├── App.jsx           # Main router and layout component
    │   ├── pages/
    │   │   ├── Landing.jsx   # Unauthenticated landing page
    │   │   ├── Login.jsx     # User login form
    │   │   ├── Register.jsx  # User registration form
    │   │   ├── Dashboard.jsx # Configuration management
    │   │   └── Session.jsx   # Pomodoro timer interface
    │   ├── index.css         # Tailwind imports and custom styles
    │   └── main.jsx          # React entry point
    └── package.json          # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

**1. Start the Backend Server**

```bash
cd server
npm install
npm run dev
```

The backend will run on `http://localhost:4000`

**2. Start the Frontend Dev Server**

```bash
cd client
npm install
npm run dev
```

Open your browser to the URL printed by Vite (typically `http://localhost:5173`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Configurations
- `GET /api/configs` - Get all available configurations
- `POST /api/configs` - Create a new configuration
- `PUT /api/configs/:id` - Update a configuration
- `DELETE /api/configs/:id` - Delete a configuration (protected for default config)

### Sessions
- `POST /api/session/start` - Start a new pomodoro session
- `POST /api/session/:id/input` - Save focus input for a session
- `GET /api/session/:id` - Get session details

## How to Use

1. **Register/Login**: Create an account or login with existing credentials
2. **Configure (Optional)**: Visit the Configurations page to create custom timer settings, or use the default 25/5/15 config
3. **Start Session**: Click the play button to begin your Pomodoro timer
4. **Focus**: Use the focus input field to track what you're working on
5. **Complete**: When the timer finishes, you'll receive an audio notification
6. **Review**: Track your sessions and completed pomodoros

## Future Enhancements

- Integration with AWS services (RDS for database, Cognito for auth, S3 for file storage)
- Custom audio file uploads for notifications
- Session history and productivity analytics
- Dark/Light theme toggle
- Mobile-optimized responsive design
- Browser notifications and desktop alerts
- Team collaboration features

## Storage & Data

Currently, the app uses JSON file storage (`server/storage.json`) for development simplicity. This is suitable for learning and testing but should be replaced with a proper database (RDS, MongoDB, etc.) for production use.

## Notes

- The default Pomodoro configuration is immutable and stored in the system. Users cannot delete or modify the default 25/5/15 setup.
- Session data and distraction tracking are stored locally on the server.
- Authentication uses JWT tokens stored in localStorage on the client.

## License

MIT
