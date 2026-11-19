# Course Portal API

A small REST backend for a university course portal: list courses, enrol a student, cancel an enrolment. The same API is written three times, in Express, Fastify and Hono (TypeScript), so you can compare frameworks side by side.

## Run it

Needs Node.js 20 or newer.

```bash
npm install
npm run dev          # Express on http://localhost:3000 (restarts when you save)
```

Open http://localhost:3000 for a small frontend that calls the API, or call it directly:

```bash
curl http://localhost:3000/api/courses
curl -X POST http://localhost:3000/api/enrolments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 42, "courseCode": "CS201"}'
```

The other two versions:

```bash
npm run fastify      # Fastify on http://localhost:3001
npm run hono         # Hono, in TypeScript, on http://localhost:3002
```

`requests.http` has every request ready to click if you use the VS Code REST Client extension.

## The API

| Method | Path | Returns |
| --- | --- | --- |
| GET | /api/courses | 200, all courses with seats left |
| GET | /api/courses/:code | 200, or 404 if the course does not exist |
| GET | /api/enrolments | 200, all enrolments |
| POST | /api/enrolments | 201 created, 400 bad input, 404 unknown course, 409 already enrolled or course full |
| DELETE | /api/enrolments/:id | 204 removed, or 404 |

## What is where

```
src/courses.js          business rules and data (no framework code)
src/express-server.js   Express version
src/fastify-server.js   Fastify version, with schema validation
src/hono-server.ts      Hono version, in TypeScript
public/index.html       a small frontend served by Express
requests.http           ready-made requests
```

The rules live in `courses.js` and every server only maps HTTP routes onto them. That is the point to notice: changing the framework does not change the rules.

Data is kept in memory, so restarting the server resets it.

## Demo flow for the lecture (about 5 minutes)

1. `npm run dev`, then open http://localhost:3000 with DevTools open on the Network tab.
2. Click Enrol on CS201. Show the POST request, its JSON body and the `201 Created` response.
3. Click Enrol on CS201 again. Show the `409` and point out the server enforced the rule, not the page.
4. Click Enrol on CS203 with student IDs 1, 2 and 3. The third gets `409 CS203 is full`.
5. Open `src/express-server.js` next to `src/hono-server.ts`. Same routes, different syntax, same `courses.js` underneath.

## Try next

- Add `PATCH /api/courses/:code` to change the number of seats.
- Replace the arrays in `courses.js` with a PostgreSQL database on Supabase or Neon.
- Send a bad body to the Fastify version and see the automatic 400 from its schema.
