# E-commerce Image Management System

## Overview

This is a comprehensive e-commerce web application specialized in clothing product photo management, offering advanced image processing and visualization tools for fashion professionals. The system provides model and shirt image upload capabilities, advanced filtering, image preview and combination tools, and role-based authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Query (TanStack Query) for server state, custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **File Upload**: Multer for handling multipart form data
- **External Integration**: Adobe Photoshop automation via shell scripts and AppleScript

### Database Layer
- **Primary Database**: Currently configured for PostgreSQL (connection string in .env)
- **ORM**: Drizzle ORM with schema-first approach
- **Fallback**: SQLite support with better-sqlite3 (as mentioned in README)
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- Session-based authentication using express-session with memory store
- Role-based access control (admin vs regular users)
- Password hashing using Node.js crypto module with scrypt

### Image Management
- **Model Management**: Upload and manage fashion model images with metadata (direction, color, gender, dimensions)
- **Shirt Management**: Upload and manage shirt/clothing product images
- **Combined Images**: Generate composite images by merging model and shirt images via Photoshop automation

### File Processing Pipeline
- Multer-based file upload to `/public/uploads/` directory
- Adobe Photoshop integration via shell scripts for image composition
- Automated file naming with timestamps and type prefixes

### Filtering System
- Advanced multi-criteria filtering for both models and shirts
- Metadata-based filtering including size, color, brand, gender, events, genres
- Dynamic filter application with real-time updates

### User Interface
- **Admin Interface**: Full CRUD operations, user management, advanced filtering
- **Wizard Interface**: Simplified workflow for non-admin users
- Responsive design with mobile support
- Real-time image preview and selection

## Data Flow

1. **Image Upload**: Files uploaded via multipart forms → Multer middleware → Local storage
2. **Database Storage**: Image metadata and file paths stored in respective tables
3. **Image Combination**: User selects model + shirt → Shell script triggers Photoshop automation → Result saved to database
4. **Filtering**: Client-side filtering using metadata → Real-time UI updates
5. **Download**: Individual files or ZIP packages of combined images

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (primary), SQLite (fallback)
- **UI Components**: Radix UI ecosystem for accessible components
- **Image Processing**: Adobe Photoshop 2025 (macOS only)
- **File Handling**: Native Node.js fs module with Multer

### Development Tools
- **Testing**: Vitest with React Testing Library
- **Build**: Vite with esbuild for production
- **Type Checking**: TypeScript with strict configuration
- **Linting**: Built-in TypeScript checking

### Photoshop Automation
- Requires Adobe Photoshop 2025 on macOS
- Uses AppleScript for automation triggering
- Custom JSX scripts for Photoshop actions
- Shell scripts for workflow orchestration

## Deployment Strategy

### Development Environment
- Local development server on port 12345
- Hot module replacement via Vite
- SQLite database for local development
- File uploads stored in `/server/public/uploads/`

### Production Environment
- **Platform**: Google Cloud Run
- **Build Process**: Vite build for frontend, esbuild for backend
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Static Files**: Served via Express static middleware
- **Session Storage**: Memory store (suitable for single-instance deployment)

### Configuration
- Environment-based configuration via process.env
- Development vs production builds with different optimizations
- Port configuration supports both local (12345) and cloud deployment (80)

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 16, 2025. Initial setup