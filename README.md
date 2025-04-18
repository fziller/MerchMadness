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
- PostgreSQL database
- npm or yarn package manager

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://${USER}@localhost:5432/merchmadness
```

3.1 Install Postgres

- via Brew or via installer
  `brew install postgresql`
  psql -U your_username -d postgres
  CREATE DATABASE merchmadness;

4. Initialize the database:

```bash
npm run db:push
```

4.1
Manually adding a user to login (should not be necessary):

```bash
psql -U your_username -d postgres
\c merchmadness
INSERT INTO users(id, username, password, is_admin, created_at) VALUES (12345, 'fziller', 'fziller', true, '2013-01-01 08:45:00 PST');
```

5. Start the development server:

```bash
 DATABASE_URL=postgresql://${USER}:@localhost:5432/merchmadness npm run dev
```

The application will be available at `http://localhost:12345`

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
