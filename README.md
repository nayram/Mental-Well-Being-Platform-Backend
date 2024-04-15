# Mental Well-Being Platform Backend

### Overview

This project involves developing a Node.js backend for a software platform designed to enhance users' mental well-being through a curated set of activities. These activities focus on promoting relaxation, boosting self-esteem, improving productivity, enhancing physical health, and fostering social connections.

### Features

Users should be able to:

- Register and log in.
- List all available activities.
- Mark activities as completed.
- List their completed activities.

## Installation

- Install [NodeJS](https://nodejs.org/en/) lts or latest version
- Install [Docker](https://www.docker.com/get-started/)

- In root directory run `npm install`
- In root dir run `docker compose up -d` to run Postgres and PgAdmin docker images for local development
- Update the config file `config/test.json` with your credentials

## Database

Postgres database will be available on http://localhost:5440

PgAdmin UI will be available on http://localhost:80

Connect to PgAdmin UI using:

- login in the UI (username: `postgres@gmail.com`, password: `postgres`)
- host: `host.docker.internal`
- port: `5440`
- username/password/maintenance database:`postgres`

## Running the app

Make sure to run the migrations before running the app (see Migrations section below)

### Development:

- To start the project in dev mode, run `npm run dev`

### Production:

- To build the project, run `npm run build`
- To start the project in prod mode, run `npm run start`

### Testing:

- Please note the tests setup will use enviromental vars from `config/test.json`
- Please run the `npm test:migration:up` before running the tests. This sets up the test database
- To run all tests once, run `npm run test`
- To run all tests and watch for changes `npm run test:watch`

### Lint:

- To run the lint, run `npm run lint:fix`

Application runs on [localhost:3000](http://localhost:3000) by default.

## Migrations

Migration scripts:

- The migration scripts are located in `src/scripts/migrations`
- `npm run migration:repair` - repairs all migrations
- `npm run migration:create ${name-of-migration}` - creates new migration file
- `npm run migration:up` - runs migration
- `npm run migration:down` - reverts all migrations

- To seed the database with default activities, run `npm run seed:activity`

## Swagger

Swagger will be available on http://localhost:3000/docs by default

### Dependencies

- Database: `@pgkit/client` - This tool provides a low level absction for working with Postgres and ensures type-safety on the db layer. For more information see: [Postgres Kit](https://github.com/mmkal/slonik-tools/tree/pgkit/packages/client#readme).
- Migrations: `@pgkit/migrator` - Similar to `@pgkit/client`, but for managing migrations. More information can be found [here](https://github.com/mmkal/slonik-tools/tree/pgkit/packages/migrator).
- Logging: `pino`
- Errors: `pino`
- Validation: `joi`
- Environment: `config`

### Data Models

- Activity: `ActivityModel` - This model describes the structure of an activity. For more information see: [Activity Model](./src/models/activities) The ActivitySchema is defined below
- User: `UserModel` - This model describes the structure of a user. For more information see: [User Model](./src/models/users) The UserSchema is defined below
- UserActivity: `UserActivityModel` - This model describes the structure of a user activity. For more information see: [UserActivity Model](./src/models/users-activities). The UserActivity keeps track of completed activities.

### API Documentation

- Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)

### Design Decisions
- Database: [Postgres](https://www.postgresql.org/). I went with Postgres because I wanted to have strong data integrity and manage the relationships between the tables or models. Also in case the project grows in the future, postgres will be able to scale out as well and handle complex transaction requirements.
- Access Tokens: I made the decision not to save the access tokens in the db even though there might be some benefits in doing that, example revoking and invalidating the access tokens during a data breach. My goal was to make this app stateless and reduce the database read/write operations. this will improve performance of the application at scale.


### Tasks Completed

- Register `/api/v1/auth/signup [POST]`
- Login `/api/v1/auth/login [POST]`
- List all activities [GET] `/api/v1/activities`
- Mark activities as completed [PATCH] `/api/v1/user-activities/:id`
  - This requires a user token to be passed in the header `Authorization: Bearer <token>`
  - :id is the id of user activity
  - body should be `{status: "completed"}` You have other options like `PENDING, STARTED, CANCELLED`
- List completed activities [GET] `/api/v1/user-activities?status=completed&user_id=****`: This requires a user token to be passed in the header `Authorization: Bearer <token>`

### Improvements
- Improve on the test coverage. There are some utility functions that writing tests for them will be useful.
- Add test for [PATCH] `/api/v1/user-activities/:id` in the case when the id does not exist.
- Add deployment protocol needed for production.
- Complete the Bonus Feature, which is to implement CRUD endpoints to facilitate integration with third party services.
