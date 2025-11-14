# Boxing Gym Management App

A comprehensive TypeScript React web application for managing a boxing gym, built with Vite, React, TypeScript, and Tailwind CSS.

## Features

### User Management
- Create, update, and delete users
- Role-based access (Admin, Trainer, User)
- Filter users by role
- User authentication and profile management

### Exercise Categories
- Organize exercises into categories
- Full CRUD operations for categories

### Tags
- Tag exercises for better organization
- Color-coded tags with visual indicators
- Full CRUD operations

### Exercises
- Create and manage boxing exercises
- Associate exercises with categories and tags
- Set duration, descriptions, and video URLs
- Filter exercises by category

### Routines
- Build workout routines from exercises
- Add exercises to routines with customizable parameters:
  - Sets and reps
  - Rest time between sets
  - Individual notes per exercise
- Modify each exercise on an individual level within the routine
- Set difficulty levels (Beginner, Intermediate, Advanced)

### Training Sessions
- Schedule training sessions with specific routines
- Assign instructors (trainers)
- Set participant limits and track attendance
- Filter sessions by date range
- Manage session status (Scheduled, In Progress, Completed, Cancelled)

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with navigation
│   └── ProtectedRoute.tsx  # Authentication guard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Users.tsx
│   ├── ExerciseCategories.tsx
│   ├── Tags.tsx
│   ├── Exercises.tsx
│   ├── Routines.tsx
│   └── Sessions.tsx
├── services/           # API services
│   └── api.ts         # Axios API client
├── types/             # TypeScript type definitions
│   └── api.ts        # API types
├── App.tsx           # Root component with routing
├── main.tsx         # Application entry point
└── index.css        # Global styles with Tailwind
```

## API Integration

The application connects to the Boxing Gym API at:
```
https://enigma-ts-production.up.railway.app
```

### API Endpoints

- **Authentication**: `/auth/login`, `/auth/profile`
- **Users**: `/users` (CRUD operations)
- **Exercise Categories**: `/exercise-categories` (CRUD operations)
- **Tags**: `/tags` (CRUD operations)
- **Exercises**: `/exercises` (CRUD operations with filtering)
- **Routines**: `/routines` (CRUD operations with embedded exercises)
- **Sessions**: `/sessions` (CRUD operations with date filtering)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd enigma-fe-final
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Railway

### Quick Deploy

1. **Sign in to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose the `enigma-fe-final` repository
   - Select the branch: `claude/boxing-gym-management-app-01MJqF7mdkBWyzZyj3CGATLm`

3. **Railway Auto-Configuration**
   - Railway will automatically detect the settings from `railway.json`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Deploy**
   - Click "Deploy"
   - Railway will build and deploy your application
   - You'll get a public URL once deployment is complete

### Configuration Files

The project includes Railway-specific configuration:
- `railway.json` - Railway deployment configuration
- `serve.json` - Static file server configuration with SPA routing
- `package.json` - Includes `start` script for production server

### Environment Variables

If you need to configure the API URL dynamically, you can add it as an environment variable in Railway:
- Go to your project settings
- Add variable: `VITE_API_URL` with your API endpoint
- Redeploy the application

## Authentication

The application uses JWT-based authentication. Upon successful login, the token is stored in localStorage and automatically attached to API requests.

### Default Login Flow

1. Navigate to the login page
2. Enter your email and password
3. Upon successful authentication, you'll be redirected to the dashboard
4. The token will be stored and used for subsequent API calls

## Usage Guide

### Creating a Workout Routine

1. Navigate to **Exercises** and create exercises with categories and tags
2. Navigate to **Routines** and click "Add Routine"
3. Fill in routine details (name, description, difficulty)
4. Click "Add Exercise" to add exercises to the routine
5. For each exercise, you can:
   - Select from existing exercises or create a custom one
   - Set sets, reps, and rest time
   - Add individual notes
6. Save the routine

### Scheduling a Training Session

1. Ensure you have routines created
2. Navigate to **Sessions** and click "Schedule Session"
3. Fill in session details:
   - Name and description
   - Date and time
   - Select an instructor (must be a user with "trainer" role)
   - Set max participants
   - Select one or more routines
4. Save the session

### Managing Users

1. Navigate to **Users**
2. Click "Add User" to create a new user
3. Assign roles (Admin, Trainer, or User)
4. Users can be filtered by role
5. Edit or delete users as needed

## Features in Detail

### Exercise Management
- Categorize exercises (e.g., Cardio, Strength, Technique)
- Tag exercises for cross-category organization
- Add video URLs for demonstration
- Set default durations

### Routine Builder
- Combine multiple exercises into cohesive routines
- Customize each exercise within the routine:
  - Override default duration
  - Set sets and reps
  - Add rest periods
  - Include specific notes
- Track total routine duration automatically

### Session Scheduling
- Calendar-based scheduling
- Instructor assignment from trainer pool
- Participant capacity management
- Multi-routine sessions
- Status tracking (Scheduled → In Progress → Completed)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Modular component structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
