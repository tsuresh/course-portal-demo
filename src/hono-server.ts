// Hono, written in TypeScript: tiny, built on web standards,
// and the same code can run on Node.js, Bun, Deno or Cloudflare Workers.
// Run: npm run hono
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { listCourses, findCourse, listEnrolments, enrol, cancelEnrolment } from './courses.js';

// TypeScript describes the shape of the data we expect
type EnrolRequest = {
  studentId: number;
  courseCode: string;
};

const app = new Hono();

// Log every request so students can see the conversation in the terminal
app.use('*', async (c, next) => {
  await next();
  console.log(`${c.req.method} ${c.req.path} -> ${c.res.status}`);
});

app.get('/api/courses', (c) => c.json(listCourses()));

app.get('/api/courses/:code', (c) => {
  const course = findCourse(c.req.param('code'));
  if (!course) return c.json({ error: 'Course not found' }, 404);
  return c.json(course);
});

app.get('/api/enrolments', (c) => c.json(listEnrolments()));

app.post('/api/enrolments', async (c) => {
  const body = await c.req.json<EnrolRequest>().catch(() => null);
  const result = enrol(body);
  return c.json(result.body, result.status as 201 | 400 | 404 | 409);
});

app.delete('/api/enrolments/:id', (c) => {
  const result = cancelEnrolment(c.req.param('id'));
  if (result.status === 204) return c.body(null, 204);
  return c.json(result.body, 404);
});

serve({ fetch: app.fetch, port: 3002 }, () => {
  console.log('Hono API running at http://localhost:3002');
});
