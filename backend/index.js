
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

// ─── In-memory data ───────────────────────────────────────────────────────────

const employees = [
  { number: '12345', name: 'Alice Smith', lastName: 'Smith', firstName: 'Alice', birthdayMonth: 3, badgeNumber: 'B001', hasSpun: false },
  { number: '67890', name: 'Bob Johnson', lastName: 'Johnson', firstName: 'Bob', birthdayMonth: 3, badgeNumber: 'B002', hasSpun: false },
  { number: '67891', name: 'John Doe', lastName: 'Doe', firstName: 'John', birthdayMonth: 3, badgeNumber: 'B003', hasSpun: false },
  { number: '67892', name: 'Jack Williams', lastName: 'Williams', firstName: 'Jack', birthdayMonth: 3, badgeNumber: 'B004', hasSpun: false },
];

let prizes = [
  { id: 1, name: 'Movie Ticket', value: 15, isJackpot: false },
  { id: 2, name: 'Gift Card', value: 25, isJackpot: false },
  { id: 3, name: 'Extra Day Off', value: 0, isJackpot: false },
  { id: 4, name: 'Lunch Coupon', value: 20, isJackpot: false },
  { id: 5, name: 'Coffee Mug', value: 10, isJackpot: false },
  { id: 6, name: 'T-Shirt', value: 20, isJackpot: false },
  { id: 7, name: 'Snack Box', value: 30, isJackpot: false },
  { id: 8, name: 'Jackpot', value: 120, isJackpot: true },
];
let nextPrizeId = 9;

let winners = [
  { id: 1, playedAt: '2020-05-13T17:20:00Z', winner: 'Albertsen, Kyla', employeeNumber: '10347', badgeNumber: '111798', dobMonth: 'May', tempDobMonth: '', prize: 'Windfall', value: 25, pickedUpAt: '2020-05-13T18:00:00Z', status: 'Picked Up' },
  { id: 2, playedAt: '2020-05-12T11:16:00Z', winner: 'Francis, Ryan', employeeNumber: '60491', badgeNumber: '100619', dobMonth: 'May', tempDobMonth: '', prize: 'Jackpot', value: 120, pickedUpAt: null, status: 'Pending' },
];
let nextWinnerId = 3;

let tempDobs = [
  { id: 1, employeeNumber: '12345', employeeName: 'Alice Smith', originalMonth: 'March', tempMonth: 'April', reason: 'Schedule conflict', createdAt: '2024-03-01T10:00:00Z' },
];
let nextTempDobId = 2;

let birthdayMonths = [
  { month: 1, name: 'January', active: true },
  { month: 2, name: 'February', active: true },
  { month: 3, name: 'March', active: true },
  { month: 4, name: 'April', active: true },
  { month: 5, name: 'May', active: true },
  { month: 6, name: 'June', active: true },
  { month: 7, name: 'July', active: true },
  { month: 8, name: 'August', active: true },
  { month: 9, name: 'September', active: true },
  { month: 10, name: 'October', active: true },
  { month: 11, name: 'November', active: true },
  { month: 12, name: 'December', active: true },
];

let adminUsers = [
  { id: 1, name: 'Admin User', email: 'admin@ktea.org', role: 'Super Admin', createdAt: '2024-01-01T00:00:00Z' },
];
let nextAdminId = 2;

let options = {
  siteName: 'KTEA Birthday Wheel',
  maxSpinsPerMonth: 1,
  allowTempDob: true,
  autoPickupDays: 30,
};

// ─── Public endpoints ─────────────────────────────────────────────────────────

app.get('/api/prizes', (req, res) => {
  res.json({ prizes: prizes.map(p => p.name) });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'birthday-wheel-backend' });
});

app.post('/api/validate', (req, res) => {
  const { employeeNumber } = req.body;
  const now = new Date();
  const month = now.getMonth() + 1;
  const employee = employees.find(e => e.number === employeeNumber);
  if (!employee) {
    return res.status(404).json({ error: 'Your employee number was not found in the directory. Please contact IT/Desktop.' });
  }
  const tempDob = tempDobs.find(t => t.employeeNumber === employeeNumber);
  const effectiveMonth = tempDob ? new Date(`${tempDob.tempMonth} 1, 2000`).getMonth() + 1 : employee.birthdayMonth;
  if (effectiveMonth !== month) {
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
  const prizeObj = prizes[Math.floor(Math.random() * prizes.length)];
  const tempDob = tempDobs.find(t => t.employeeNumber === employeeNumber);
  const now = new Date();
  const dobMonthName = new Date(0, employee.birthdayMonth - 1).toLocaleString('default', { month: 'long' });
  winners.push({
    id: nextWinnerId++,
    playedAt: now.toISOString(),
    winner: `${employee.lastName}, ${employee.firstName}`,
    employeeNumber: employee.number,
    badgeNumber: employee.badgeNumber,
    dobMonth: dobMonthName,
    tempDobMonth: tempDob ? tempDob.tempMonth : '',
    prize: prizeObj.name,
    value: prizeObj.value,
    pickedUpAt: null,
    status: 'Pending',
  });
  res.json({ prize: prizeObj.name });
});

// ─── Admin: Winners ──────────────────────────────────────────────────────────

app.get('/api/admin/winners', (req, res) => {
  let result = [...winners];
  const { from, to, status, lastName, firstName, employeeNumber, badgeNumber } = req.query;
  if (from) result = result.filter(w => new Date(w.playedAt) >= new Date(from));
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter(w => new Date(w.playedAt) <= toDate);
  }
  if (status && status !== 'All') result = result.filter(w => w.status === status);
  if (lastName) result = result.filter(w => w.winner.toLowerCase().includes(lastName.toLowerCase()));
  if (firstName) result = result.filter(w => w.winner.toLowerCase().includes(firstName.toLowerCase()));
  if (employeeNumber) result = result.filter(w => w.employeeNumber.includes(employeeNumber));
  if (badgeNumber) result = result.filter(w => w.badgeNumber.includes(badgeNumber));
  res.json({ winners: result, total: result.length });
});

app.put('/api/admin/winners/:id/pickup', (req, res) => {
  const winner = winners.find(w => w.id === parseInt(req.params.id));
  if (!winner) return res.status(404).json({ error: 'Winner not found' });
  winner.pickedUpAt = new Date().toISOString();
  winner.status = 'Picked Up';
  res.json(winner);
});

// ─── Admin: Prizes ────────────────────────────────────────────────────────────

app.get('/api/admin/prizes', (req, res) => {
  res.json({ prizes });
});

app.post('/api/admin/prizes', (req, res) => {
  const { name, value, isJackpot } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const prize = { id: nextPrizeId++, name, value: value || 0, isJackpot: !!isJackpot };
  prizes.push(prize);
  res.status(201).json(prize);
});

app.put('/api/admin/prizes/:id', (req, res) => {
  const prize = prizes.find(p => p.id === parseInt(req.params.id));
  if (!prize) return res.status(404).json({ error: 'Prize not found' });
  const { name, value, isJackpot } = req.body;
  if (name !== undefined) prize.name = name;
  if (value !== undefined) prize.value = value;
  if (isJackpot !== undefined) prize.isJackpot = isJackpot;
  res.json(prize);
});

app.delete('/api/admin/prizes/:id', (req, res) => {
  const idx = prizes.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Prize not found' });
  prizes.splice(idx, 1);
  res.json({ ok: true });
});

// ─── Admin: Temporary DOBs ────────────────────────────────────────────────────

app.get('/api/admin/temp-dobs', (req, res) => {
  res.json({ tempDobs });
});

app.post('/api/admin/temp-dobs', (req, res) => {
  const { employeeNumber, employeeName, originalMonth, tempMonth, reason } = req.body;
  if (!employeeNumber || !tempMonth) return res.status(400).json({ error: 'employeeNumber and tempMonth are required' });
  const entry = { id: nextTempDobId++, employeeNumber, employeeName: employeeName || '', originalMonth: originalMonth || '', tempMonth, reason: reason || '', createdAt: new Date().toISOString() };
  tempDobs.push(entry);
  res.status(201).json(entry);
});

app.delete('/api/admin/temp-dobs/:id', (req, res) => {
  const idx = tempDobs.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tempDobs.splice(idx, 1);
  res.json({ ok: true });
});

// ─── Admin: Birthday Months ───────────────────────────────────────────────────

app.get('/api/admin/birthday-months', (req, res) => {
  res.json({ birthdayMonths });
});

app.put('/api/admin/birthday-months/:month', (req, res) => {
  const bm = birthdayMonths.find(m => m.month === parseInt(req.params.month));
  if (!bm) return res.status(404).json({ error: 'Month not found' });
  if (req.body.active !== undefined) bm.active = req.body.active;
  res.json(bm);
});

// ─── Admin: Admin Users ───────────────────────────────────────────────────────

app.get('/api/admin/admins', (req, res) => {
  res.json({ admins: adminUsers });
});

app.post('/api/admin/admins', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const admin = { id: nextAdminId++, name, email, role: role || 'Admin', createdAt: new Date().toISOString() };
  adminUsers.push(admin);
  res.status(201).json(admin);
});

app.delete('/api/admin/admins/:id', (req, res) => {
  const idx = adminUsers.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  adminUsers.splice(idx, 1);
  res.json({ ok: true });
});

// ─── Admin: Options ───────────────────────────────────────────────────────────

app.get('/api/admin/options', (req, res) => {
  res.json(options);
});

app.put('/api/admin/options', (req, res) => {
  Object.assign(options, req.body);
  res.json(options);
});

// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
