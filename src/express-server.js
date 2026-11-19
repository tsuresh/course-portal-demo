// Express: the classic minimal Node.js framework.
// Run: npm run dev   (restarts automatically when you save a file)
import express from 'express';
import { fileURLToPath } from 'node:url';
import { listCourses, findCourse, listEnrolments, enrol, cancelEnrolment } from './courses.js';

const app = express();
app.use(express.json()); // parse JSON request bodies
app.use(express.static(fileURLToPath(new URL('../public', import.meta.url)))); // the small frontend at http://localhost:3000

// Log every request so students can see the conversation in the terminal
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.url} -> ${res.statusCode}`));
  next();
});

// GET: read
app.get('/api/courses', (req, res) => {
  res.json(listCourses());
});

app.get('/api/courses/:code', (req, res) => {
  const course = findCourse(req.params.code);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

app.get('/api/enrolments', (req, res) => {
  res.json(listEnrolments());
});

// POST: create
app.post('/api/enrolments', (req, res) => {
  const result = enrol(req.body);
  res.status(result.status).json(result.body);
});

// DELETE: remove
app.delete('/api/enrolments/:id', (req, res) => {
  const result = cancelEnrolment(req.params.id);
  if (result.status === 204) return res.status(204).end();
  res.status(result.status).json(result.body);
});

app.listen(3000, () => {
  console.log('Express API running at http://localhost:3000');
});
