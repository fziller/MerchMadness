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

- We need to make sure that the automation is not actively saving data to make sure the basic model data stays the same.
- Make sure the automation really is only one automation and not a list of these.
