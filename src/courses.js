// Business rules for the course portal.
// This file knows nothing about Express, Fastify or Hono.
// Each server file only maps HTTP routes onto these functions,
// which is why you can swap the framework without touching the rules.

// In-memory "database". Restarting the server resets it.
const courses = [
  { code: 'CS201', title: 'Databases', seats: 3 },
  { code: 'CS202', title: 'Web Development', seats: 30 },
  { code: 'CS203', title: 'Software Architecture', seats: 2 },
];

const enrolments = [];
let nextId = 1001;

function seatsLeft(code) {
  const course = courses.find((c) => c.code === code);
  const taken = enrolments.filter((e) => e.courseCode === code).length;
  return course.seats - taken;
}

export function listCourses() {
  return courses.map((c) => ({ ...c, seatsLeft: seatsLeft(c.code) }));
}

export function findCourse(code) {
  const course = courses.find((c) => c.code === code.toUpperCase());
  return course ? { ...course, seatsLeft: seatsLeft(course.code) } : null;
}

export function listEnrolments() {
  return enrolments;
}

// Every function below returns { status, body } so any framework can send it.
export function enrol(input) {
  const studentId = Number(input?.studentId);
  const courseCode = String(input?.courseCode ?? '').toUpperCase();

  // 400: the request itself is wrong
  if (!Number.isInteger(studentId) || studentId <= 0 || !courseCode) {
    return { status: 400, body: { error: 'Send a positive studentId and a courseCode' } };
  }

  // 404: the thing they asked for does not exist
  const course = courses.find((c) => c.code === courseCode);
  if (!course) {
    return { status: 404, body: { error: `Course ${courseCode} not found` } };
  }

  // 409: the request is valid but clashes with the current state
  if (enrolments.some((e) => e.studentId === studentId && e.courseCode === courseCode)) {
    return { status: 409, body: { error: `Student ${studentId} is already enrolled in ${courseCode}` } };
  }
  if (seatsLeft(courseCode) <= 0) {
    return { status: 409, body: { error: `${courseCode} is full` } };
  }

  // 201: created
  const enrolment = { id: nextId++, studentId, courseCode, status: 'confirmed' };
  enrolments.push(enrolment);
  return { status: 201, body: enrolment };
}

export function cancelEnrolment(id) {
  const index = enrolments.findIndex((e) => e.id === Number(id));
  if (index === -1) {
    return { status: 404, body: { error: `Enrolment ${id} not found` } };
  }
  enrolments.splice(index, 1);
  return { status: 204, body: null };
}
