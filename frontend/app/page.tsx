"use client";
import React, { useState } from 'react';
import styles from "./page.module.css";
import BirthdayLogin from './BirthdayLogin';
import Wheel from './Wheel';

export default function Home() {
  const [step, setStep] = useState('login');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [error, setError] = useState('');
  const [prize, setPrize] = useState('');

  const handleLoginSuccess = (number: string, name: string) => {
    setEmployeeNumber(number);
    setEmployeeName(name);
    setStep('wheel');
    setError('');
  };

  const handleLoginError = (msg: string) => {
    setError(msg);
    setStep('error');
  };

  const handlePrize = (prize: string) => {
    setPrize(prize);
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        setStep('login');
        setEmployeeNumber('');
        setEmployeeName('');
        setPrize('');
        setError('');
      }, 20000);
    }, 2000);
  };

  const handleWheelError = (msg: string) => {
    setError(msg);
    setStep('error');
  };

  // Login step: BirthdayLogin owns the full viewport — no wrapper needed
  if (step === 'login') {
    return (
      <BirthdayLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    );
  }

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
          <div className={styles.main}>

            {step === 'wheel' && (
              <>
                <h2>Welcome, {employeeName}</h2>
                <p className={styles.subtitle}>You are verified. Spin once to record your monthly birthday prize.</p>
                <Wheel
                  employeeNumber={employeeNumber}
                  onPrize={handlePrize}
                  onError={handleWheelError}
                />
              </>
            )}

            {step === 'error' && (
              <div className={styles.errorBox}>
                <h2>Unable to Continue</h2>
                <p>{error}</p>
                <button onClick={() => setStep('login')}>Back to Login</button>
              </div>
            )}

            {step === 'done' && (
              <div className={styles.doneBox}>
                <h2>Prize Recorded</h2>
                <p className={styles.doneName}>{employeeName}</p>
                <div className={styles.prizePill}>{prize}</div>
                <p>Returning to login in a few seconds.</p>
              </div>
            )}

          </div>
        </main>
      </section>
    </div>
  );
}