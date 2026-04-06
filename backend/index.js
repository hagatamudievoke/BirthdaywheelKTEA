
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS blocked for origin: ' + origin));
  },
}));

app.use(express.json());

// Serve available prizes for the wheel
app.get('/api/prizes', (req, res) => {
  res.json({ prizes });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'birthday-wheel-backend' });
});

// In-memory data for demo
const employees = [
  { number: '12345', name: 'Alice', birthdayMonth: 3, hasSpun: false },
  { number: '67890', name: 'Bob', birthdayMonth: 3, hasSpun: false },
  { number: '67891', name: 'John', birthdayMonth: 3, hasSpun: false },
  { number: '67892', name: 'Jack', birthdayMonth: 3, hasSpun: false },
];
const prizes = ['Movie Ticket', 'Gift Card', 'Extra Day Off', 'Lunch Coupon', 'Coffee Mug', 'T-Shirt', 'Snack Box', 'Surprise Gift'];

app.post('/api/validate', (req, res) => {
  const { employeeNumber } = req.body;
  const now = new Date();
  const month = now.getMonth() + 1;
  const employee = employees.find(e => e.number === employeeNumber);
  if (!employee) {
    return res.status(404).json({ error: 'Your employee number was not found in the directory. Please contact IT/Desktop.' });
  }
  if (employee.birthdayMonth !== month) {
    return res.status(403).json({ error: 'It is not your birthday month.' });
  }
  if (employee.hasSpun) {
    return res.status(403).json({ error: 'You have already spun the wheel this month.' });
  }
  res.json({ success: true, name: employee.name });
});

app.post('/api/spin', (req, res) => {
  const { employeeNumber } = req.body;
  const employee = employees.find(e => e.number === employeeNumber);
  if (!employee || employee.hasSpun) {
    return res.status(403).json({ error: 'Invalid spin attempt.' });
  }
  employee.hasSpun = true;
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  res.json({ prize });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
