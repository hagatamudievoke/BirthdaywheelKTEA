"use client";
import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { apiUrl } from './api';

const BALLOONS = [
  { color: '#ff6b6b', shine: '#ff9999', left: '5%',  size: 70, delay: '0s',   dur: '7s'  },
  { color: '#ffd93d', shine: '#ffe88a', left: '12%', size: 55, delay: '1.2s', dur: '9s'  },
  { color: '#6bcb77', shine: '#98e0a0', left: '20%', size: 65, delay: '0.4s', dur: '8s'  },
  { color: '#4d96ff', shine: '#7ab3ff', left: '78%', size: 60, delay: '0.8s', dur: '10s' },
  { color: '#c77dff', shine: '#dba4ff', left: '86%', size: 72, delay: '1.8s', dur: '7.5s'},
  { color: '#ff9f43', shine: '#ffbf76', left: '93%', size: 50, delay: '0.2s', dur: '8.5s'},
  { color: '#ff6b6b', shine: '#ff9999', left: '30%', size: 45, delay: '2.5s', dur: '11s' },
  { color: '#4d96ff', shine: '#7ab3ff', left: '65%', size: 58, delay: '1s',   dur: '9.5s'},
  { color: '#6bcb77', shine: '#98e0a0', left: '50%', size: 48, delay: '3s',   dur: '8s'  },
  { color: '#ffd93d', shine: '#ffe88a', left: '42%', size: 62, delay: '0.6s', dur: '12s' },
];

const CONFETTI_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f43'];
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 3.6) % 100}%`,
  delay: `${(i * 0.25) % 5}s`,
  dur: `${4 + (i % 4)}s`,
  size: 6 + (i % 6),
  rotate: i % 2 === 0 ? 'square' : 'circle',
}));

function BalloonSVG({ color, shine, size }) {
  const w = size;
  const h = size * 1.25;
  return (
    <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} fill="none">
      {/* balloon body */}
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={color} />
      {/* shine */}
      <ellipse cx={w * 0.35} cy={h * 0.28} rx={w * 0.12} ry={h * 0.09} fill={shine} opacity="0.7" />
      {/* knot */}
      <ellipse cx={w / 2} cy={h - 2} rx={4} ry={5} fill={color} />
      {/* string */}
      <path d={`M${w / 2} ${h + 3} Q${w / 2 - 6} ${h + 12} ${w / 2} ${h + 20}`} stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function BirthdayLogin({ onSuccess, onError }) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [jackpot, setJackpot] = useState(100);
  const [adminMode, setAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/jackpot'))
      .then(r => r.json())
      .then(d => { if (d.amount) setJackpot(d.amount); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeNumber: employeeNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      onSuccess(employeeNumber.trim(), data.name);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser.trim(), password: adminPass.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      sessionStorage.setItem('adminAuthed', data.name || 'Admin');
      window.location.href = '/admin';
    } catch (err) {
      onError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Confetti */}
      {CONFETTI.map(c => (
        <div
          key={c.id}
          className={styles.confetti}
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: c.rotate === 'circle' ? '50%' : '2px',
            animationDelay: c.delay,
            animationDuration: c.dur,
          }}
        />
      ))}

      {/* Floating balloons */}
      {BALLOONS.map((b, i) => (
        <div
          key={i}
          className={styles.balloon}
          style={{
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        >
          <BalloonSVG color={b.color} shine={b.shine} size={b.size} />
        </div>
      ))}

      {/* Center glassmorphism card */}
      <main className={styles.center}>
        <div className={styles.card}>
          {/* Emoji cake hero */}
          <div className={styles.heroEmoji}>🎂</div>

          <h1 className={styles.welcomeTitle}>Welcome to the NQ Birthday Wheel!</h1>

          <p className={styles.welcomeText}>
            Spin on your birthday month for great prizes and a chance to win
            the <strong>Progressive Jackpot!</strong> Jackpot starts at{' '}
            <strong>$100</strong> and increases by <strong>$5</strong> for
            every non-jackpot win. Jackpot resets to $100 once won.
          </p>

          <div className={styles.jackpotBox}>
            <span className={styles.jackpotLabel}>🏆 Current Jackpot</span>
            <span className={styles.jackpotAmount}>${jackpot}</span>
          </div>

          {!adminMode ? (
            <form onSubmit={handleSubmit} autoComplete="off" className={styles.form}>
              <label className={styles.inputLabel} htmlFor="emp">
                Employee Number
              </label>
              <input
                id="emp"
                className={styles.input}
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="e.g. 12345"
              />
              <button
                className={styles.button}
                type="submit"
                disabled={loading || !employeeNumber.trim()}
              >
                {loading ? 'Validating…' : '🎡 Spin the Wheel!'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} autoComplete="off" className={styles.form}>
              <label className={styles.inputLabel} htmlFor="adm-user">Admin Username</label>
              <input
                id="adm-user"
                className={styles.input}
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                disabled={adminLoading}
                autoFocus
                placeholder="admin"
              />
              <label className={styles.inputLabel} htmlFor="adm-pass">Password</label>
              <input
                id="adm-pass"
                className={styles.input}
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                disabled={adminLoading}
                placeholder="••••••••"
              />
              <button
                className={styles.button}
                type="submit"
                disabled={adminLoading || !adminUser.trim() || !adminPass.trim()}
              >
                {adminLoading ? 'Signing in…' : '🔐 Admin Sign In'}
              </button>
            </form>
          )}
          <div className={styles.adminToggle}>
            <button
              type="button"
              className={styles.adminLink}
              onClick={() => { setAdminMode(m => !m); setAdminUser(''); setAdminPass(''); }}
            >
              {adminMode ? '← Back to Employee Login' : '🔐 Admin Login'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
