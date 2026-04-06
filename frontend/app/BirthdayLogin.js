"use client";
import React, { useState } from 'react';
import styles from './login.module.css';
import { apiUrl } from './api';

export default function BirthdayLogin({ onSuccess, onError }) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className={styles.screen}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>System Catalog</div>
        <div className={styles.navItemActive}>Birthday Wheel</div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <h1>Birthday Wheel Admin</h1>
          <span className={styles.badge}>KTEA</span>
        </header>

        <main className={styles.canvas}>
          <div className={styles.card}>
            <p className={styles.label}>Employee Verification</p>
            <h2 className={styles.title}>Enter Employee Number</h2>
            <p className={styles.subtitle}>Eligible users can spin one time in their birthday month.</p>

            <form onSubmit={handleSubmit} autoComplete="off" className={styles.form}>
              <label className={styles.fieldLabel} htmlFor="employee-number">
                Employee Number
              </label>
              <input
                id="employee-number"
                className={styles.input}
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="Example: 12345"
              />

              <button className={styles.button} type="submit" disabled={loading || !employeeNumber.trim()}>
                {loading ? 'Validating...' : 'Continue to Wheel'}
              </button>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
}