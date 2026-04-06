"use client";
import React, { useState } from 'react';
import styles from "./page.module.css";
import BirthdayLogin from './BirthdayLogin';
import Wheel from './Wheel';

const CONFETTI_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f43'];
const CONFETTI_PIECES = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${((i * 100) / 90).toFixed(1)}%`,
  delay: `${((i * 0.07) % 1.8).toFixed(2)}s`,
  dur: `${2.4 + (i % 6) * 0.35}s`,
  size: 7 + (i % 7),
  shape: i % 3 === 0 ? 'circle' : 'square',
}));

function playWinFanfare() {
  try {
    const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx: AudioContext = new AudioCtor();
    const t = ctx.currentTime;

    // Ascending arpeggio: C5 E5 G5 C6
    const arpNotes = [523.25, 659.25, 783.99, 1046.5];
    arpNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.14);
      gain.gain.linearRampToValueAtTime(0.32, t + i * 0.14 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.14 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.14);
      osc.stop(t + i * 0.14 + 0.6);
    });

    // Final sustained chord
    const cs = t + arpNotes.length * 0.14 + 0.06;
    [523.25, 659.25, 783.99].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, cs);
      gain.gain.linearRampToValueAtTime(0.25, cs + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, cs + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(cs);
      osc.stop(cs + 1.7);
    });
  } catch (_) {}
}

export default function Home() {
  const [step, setStep] = useState<'login' | 'wheel' | 'done' | 'error'>('login');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [error, setError] = useState('');
  const [prize, setPrize] = useState('');
  const [confetti, setConfetti] = useState(false);

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

  const handlePrize = (won: string) => {
    setPrize(won);
    setConfetti(true);
    playWinFanfare();
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        setStep('login');
        setEmployeeNumber('');
        setEmployeeName('');
        setPrize('');
        setError('');
        setConfetti(false);
      }, 20000);
    }, 2000);
  };

  const handleWheelError = (msg: string) => {
    setError(msg);
    setStep('error');
  };

  if (step === 'login') {
    return (
      <BirthdayLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    );
  }

  return (
    <div className={styles.page}>
      {/* Confetti burst on win */}
      {confetti && CONFETTI_PIECES.map(p => (
        <div
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}

      <main className={styles.main}>
        {step === 'wheel' && (
          <div className={styles.wheelSection}>
            <p className={styles.welcomeGreet}>
              🎂 Happy Birthday, <strong>{employeeName}</strong>!
            </p>
            <p className={styles.welcomeSub}>Spin the wheel to claim your birthday prize.</p>
            <Wheel
              employeeNumber={employeeNumber}
              onPrize={handlePrize}
              onError={handleWheelError}
            />
          </div>
        )}

        {step === 'error' && (
          <div className={styles.stateBox}>
            <div className={styles.stateEmoji}>⚠️</div>
            <h2 className={styles.stateTitle}>Unable to Continue</h2>
            <p className={styles.errorMsg}>{error}</p>
            <button className={styles.backBtn} onClick={() => setStep('login')}>
              ← Back to Login
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.stateBox}>
            <div className={styles.stateEmoji}>🎉</div>
            <h2 className={styles.stateTitle}>Prize Recorded!</h2>
            <p className={styles.doneName}>{employeeName}</p>
            <div className={styles.prizePill}>{prize}</div>
            <p className={styles.doneNote}>Returning to login in a few seconds…</p>
          </div>
        )}
      </main>
    </div>
  );
}
