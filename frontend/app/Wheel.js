"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './wheel.module.css';
import { apiUrl } from './api';

export default function Wheel({ employeeNumber, onPrize, onError }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const [prizes, setPrizes] = useState(['Loading...']);
  const currentAngle = useRef(0);

  useEffect(() => {
    fetch(apiUrl('/api/prizes'))
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.prizes) && d.prizes.length > 0) {
          setPrizes(d.prizes);
        }
      })
      .catch(() => {
        setPrizes(['Movie Ticket', 'Gift Card', 'Extra Day Off', 'Lunch Coupon', 'Coffee Mug', 'T-Shirt', 'Snack Box', 'Surprise Gift']);
      });
  }, []);

  const spinWheel = async () => {
    if (spinning || result) return;
    setSpinning(true);
    try {
      const res = await fetch(apiUrl('/api/spin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      const prizeIndex = prizes.indexOf(data.prize);
      const sliceAngle = 360 / prizes.length;
      const targetSlice = -(prizeIndex * sliceAngle + sliceAngle / 2) + 270;
      const spins = 360 * 7;
      const newAngle = currentAngle.current + spins + ((targetSlice - (currentAngle.current % 360) + 360) % 360);
      currentAngle.current = newAngle;
      setAngle(newAngle);

      setTimeout(() => {
        setResult(data.prize);
        onPrize(data.prize);
        setSpinning(false);
      }, 4500);
    } catch (err) {
      onError(err.message);
      setSpinning(false);
    }
  };

  const n = prizes.length;
  const cx = 200;
  const cy = 200;
  const R = 185;
  const innerR = 38;

  const COLORS = [
    ['#ff6b6b', '#ff9999'],
    ['#ffd93d', '#ffe88a'],
    ['#6bcb77', '#98e0a0'],
    ['#4d96ff', '#7ab3ff'],
    ['#c77dff', '#dba4ff'],
    ['#ff9f43', '#ffbf76'],
    ['#00d2d3', '#54a0ff'],
    ['#ff6b9d', '#ff9fcb'],
  ];

  const slices = prizes.map((prize, i) => {
    const startDeg = (i * 360) / n;
    const endDeg   = ((i + 1) * 360) / n;
    const startRad = (startDeg - 90) * Math.PI / 180;
    const endRad   = (endDeg   - 90) * Math.PI / 180;
    const midRad   = ((startDeg + endDeg) / 2 - 90) * Math.PI / 180;
    const large    = endDeg - startDeg > 180 ? 1 : 0;

    const x1 = cx + R * Math.cos(startRad), y1 = cy + R * Math.sin(startRad);
    const x2 = cx + R * Math.cos(endRad),   y2 = cy + R * Math.sin(endRad);
    const xi1= cx + innerR * Math.cos(startRad), yi1= cy + innerR * Math.sin(startRad);
    const xi2= cx + innerR * Math.cos(endRad),   yi2= cy + innerR * Math.sin(endRad);

    const textR = R * 0.65;
    const tx = cx + textR * Math.cos(midRad);
    const ty = cy + textR * Math.sin(midRad);
    const textAngle = (startDeg + endDeg) / 2;

    const [base, light] = COLORS[i % COLORS.length];
    const gradId = `grad${i}`;

    return { prize, i, large, x1, y1, x2, y2, xi1, yi1, xi2, yi2, tx, ty, textAngle, base, light, gradId };
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <h3>Spin Wheel</h3>
        <span className={styles.employeeTag}>Employee #{employeeNumber}</span>
      </div>

      <div className={styles.stage}>
        <div className={styles.glow} />
        <svg
          className={styles.svg}
          viewBox="0 0 400 400"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none',
          }}
        >
            <defs>
              {slices.map(s => (
                <radialGradient key={s.gradId} id={s.gradId} cx="60%" cy="30%" r="80%">
                  <stop offset="0%"   stopColor={s.light} />
                  <stop offset="100%" stopColor={s.base}  />
                </radialGradient>
              ))}
              <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
              </radialGradient>
            </defs>

            {slices.map(s => (
              <g key={s.prize + s.i}>
                <path
                  d={`M${cx},${cy} L${s.x1},${s.y1} A${R},${R} 0 ${s.large} 1 ${s.x2},${s.y2} Z`}
                  fill={`url(#${s.gradId})`}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                />
                <path
                  d={`M${cx},${cy} L${s.xi1},${s.yi1} A${innerR},${innerR} 0 ${s.large} 1 ${s.xi2},${s.yi2} Z`}
                  fill="rgba(255,255,255,0.08)"
                />
                <text
                  x={s.tx} y={s.ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={n > 8 ? '11' : '13'}
                  fontWeight="700"
                  fontFamily="var(--font-heading), sans-serif"
                  fill="#fff"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}
                  transform={`rotate(${s.textAngle}, ${s.tx}, ${s.ty})`}
                >
                  {s.prize.length > 12 ? s.prize.slice(0, 11) + '…' : s.prize}
                </text>
              </g>
            ))}

            <circle cx={cx} cy={cy} r={R} fill="url(#innerShadow)" />

            {Array.from({ length: n * 2 }).map((_, i) => {
              const a = (i * 360 / (n * 2) - 90) * Math.PI / 180;
              return (
                <circle
                  key={i}
                  cx={cx + (R - 8) * Math.cos(a)}
                  cy={cy + (R - 8) * Math.sin(a)}
                  r="3"
                  fill="rgba(255,255,255,0.35)"
                />
              );
            })}
        </svg>

        <div className={styles.pointer} />
        <div className={styles.hub} />
      </div>

      <button className={styles.button} onClick={spinWheel} disabled={spinning || !!result}>
        {spinning ? 'Spinning...' : result ? 'Prize Recorded' : 'Spin Wheel'}
      </button>

      {result && (
        <div className={styles.result}>
          <span>Winner Prize</span>
          <strong>{result}</strong>
        </div>
      )}
    </div>
  );
}