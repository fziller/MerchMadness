# E-commerce Image Management System

This project is a comprehensive e-commerce web application specialized in clothing product photo management, offering advanced image processing and visualization tools for fashion professionals.

## Features

- Model and shirt image upload and management
- Advanced filtering capabilities
- Image preview and combination tools
- Role-based authentication system
- Responsive design

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Database

This application uses **SQLite** as its database engine, which provides:
- Zero-configuration setup
- File-based storage (`database.db`)
- ACID compliance
- Cross-platform compatibility
- No external database server required

The SQLite database is automatically created and initialized when the application starts. All tables are created with proper relationships and constraints.

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:12345`

The SQLite database file (`database.db`) will be automatically created in the project root directory on first run.

## Database Schema

The application uses the following tables:
- **users**: User authentication and authorization
- **models**: Model image data and metadata
- **shirts**: Shirt design data and metadata  
- **combined_images**: Generated combination images linking models and shirts

All tables are automatically created with proper indexes and foreign key constraints.

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/db` - Database models and migrations
- `/public` - Static assets

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run db:push` - Push database schema changes
- `npm start` - Run the production server

## Technology Stack

- Frontend:

  - React.js with TypeScript
  - TanStack Query for data fetching
  - Tailwind CSS for styling
  - shadcn/ui components

- Backend:
  - Node.js with Express
  - PostgreSQL with Drizzle ORM
  - Passport.js for authentication

## Some memos

## About Photoshop autmations

### Requirements

- The model file needs to have a specific layer for the smart object, which is called 'Smart-Objekt'.
- The first step of the automation (right after opening the model) needs to be to navigate to the 'Smart-Object' layer.
- Photoshop needs to be available on the machine where the app is running.

### Troubleshooting

#### The command 'play' is not currently available.

This issue can have multiple problems:

- After opening the model file, the automation needs to access to layer 'Smart-Objekt'. If the automation
  does not provide this as a first step, it needs to be added. This can be done via recording a step and adding it
  into the automation. Make sure this is happening.
- It can happen, that the same automation is available multiple times and it will access an older version. Makes sure to
  delete all available automations before triggering another run with an automation.

#### The result looks bad using the app, but good when automation runs manually.

- Make sure the automation is not saving the model file. It needs to be clean when starting the automation.
