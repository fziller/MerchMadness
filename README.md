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
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
