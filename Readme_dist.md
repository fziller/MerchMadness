## Prerequisites

- Node.js 18 or higher
- npm
- Adobe Photoshop 2025

## Database

This application uses **SQLite** as its database engine, which provides:

- Zero-configuration setup
- File-based storage (`database.db`)
- ACID compliance
- Cross-platform compatibility
- No external database server required

The SQLite database is automatically created and initialized when the application starts. All tables are created with proper relationships and constraints.

## Getting Started

1. Unzip the zip file (well done)
2. Install dependencies by executing

```bash
npm i --force
```

3. Start the development server:

```bash
NODE_ENV=production node index.js
```

The application will be available at `http://localhost:4999`

The SQLite database file (`database.db`) will be automatically created in the project root directory on first run.

## Default Users

The application automatically creates two default users on first startup:

| Username | Password | Role          |
| -------- | -------- | ------------- |
| admin    | admin    | Administrator |
| user     | user     | Regular User  |

You can log in with either account to access the application. Admin users have additional privileges for user management and system administration.

## Database Schema

The application uses the following tables:

- **users**: User authentication and authorization
- **models**: Model image data and metadata
- **shirts**: Shirt design data and metadata
- **combined_images**: Generated combination images linking models and shirts

All tables are automatically created with proper indexes and foreign key constraints.

## Production

- Make sure to have at least `node 18` installed.
- Run `yarn build` to bundle client and server into dist directory.
- Go into ` cd dist` and run `npm i --force`.
- Run `NODE_ENV=production node index.js`.

## Technology Stack

- Frontend:

  - React.js with TypeScript
  - TanStack Query for data fetching
  - Tailwind CSS for styling
  - shadcn/ui components

- Backend:
  - Node.js with Express
  - SQlite DB with Drizzle ORM
  - Passport.js for authentication

## About Photoshop automations

### Requirements

- The model file needs to have a specific layer for the smart object, which is called 'Smart-Objekt'.
- The first step of the automation (right after opening the model) needs to be to navigate to the 'Smart-Objekt' layer.
- Photoshop needs to be available on the machine where the app is running.
- The automation file name must be exactly the same as the name of the automation in photoshop.
- The app requires `Adobe Photoshop 2025`. If any other Photoshop version is being used, make sure to adapt the parameter `PS_APP` in both scropts `runGetImageFromPSFile.sh` and `runTriggerMerchMadnessAction.sh`.

### Troubleshooting

#### The command 'play' is not currently available.

This issue can have multiple problems:

- After opening the model file, the automation needs to access to layer 'Smart-Objekt'. If the automation
  does not provide this as a first step, it needs to be added. This can be done via recording a step and adding it
  into the automation. Make sure this is happening.
- It can happen, that the same automation is available multiple times and it will access an older version. Makes sure to
  delete all available automations before triggering another run with an automation.
- Either the model file, the shirt file, the automation file or the automation itself does not exist. Check if all file pathes and names are correctly set in `triggerMerchMadnessAction.jsx` after a failed merge.

#### The result looks bad using the app, but good when automation runs manually.

- Make sure the automation is not saving the model file. It needs to be clean when starting the automation.
