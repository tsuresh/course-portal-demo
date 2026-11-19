// Fastify: Express-like, faster, with built-in input validation.
// Run: npm run fastify
import Fastify from 'fastify';
import { listCourses, findCourse, listEnrolments, enrol, cancelEnrolment } from './courses.js';

const app = Fastify({ logger: false });

// Log every request so students can see the conversation in the terminal
app.addHook('onResponse', async (req, reply) => {
  console.log(`${req.method} ${req.url} -> ${reply.statusCode}`);
});

app.get('/api/courses', async () => listCourses());

app.get('/api/courses/:code', async (req, reply) => {
  const course = findCourse(req.params.code);
  if (!course) return reply.code(404).send({ error: 'Course not found' });
  return course;
});

app.get('/api/enrolments', async () => listEnrolments());

// Fastify checks the body against this schema before your code runs.
// A bad request gets a 400 automatically.
const enrolSchema = {
  body: {
    type: 'object',
    required: ['studentId', 'courseCode'],
    properties: {
      studentId: { type: 'integer', minimum: 1 },
      courseCode: { type: 'string', minLength: 1 },
    },
  },
};

app.post('/api/enrolments', { schema: enrolSchema }, async (req, reply) => {
  const result = enrol(req.body);
  return reply.code(result.status).send(result.body);
});

app.delete('/api/enrolments/:id', async (req, reply) => {
  const result = cancelEnrolment(req.params.id);
  if (result.status === 204) return reply.code(204).send();
  return reply.code(result.status).send(result.body);
});

await app.listen({ port: 3001 });
console.log('Fastify API running at http://localhost:3001');
