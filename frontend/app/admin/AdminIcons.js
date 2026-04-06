import React from 'react';

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
};

export function SidebarLogoIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function WinnersIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <path d="M7 5h10v3a5 5 0 0 1-10 0V5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 7H5a2 2 0 0 0 2 2M17 7h2a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 15h4v2a2 2 0 0 1-4 0v-2zM8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TempDobIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PrizesIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v10M4 14h16" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10s-3-1.2-3-3a2 2 0 0 1 3 0M12 10s3-1.2 3-3a2 2 0 0 0-3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MonthsIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 16h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 14.5l2-2 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OptionsIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.8 6.8l1.6 1.6M15.6 15.6l1.6 1.6M17.2 6.8l-1.6 1.6M8.4 15.6l-1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AdminsIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 18.5a4.5 4.5 0 0 1 9 0M13.5 18.5a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AdminShieldIcon() {
  return (
    <svg {...baseProps} aria-hidden="true">
      <path d="M12 3l6 2.5v5.2c0 4.1-2.6 7.1-6 8.8-3.4-1.7-6-4.7-6-8.8V5.5L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11.8l1.7 1.7 3.3-3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
