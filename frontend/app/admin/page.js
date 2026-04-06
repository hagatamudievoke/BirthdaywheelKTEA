"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';
import { apiUrl } from '../api';

const TABS = ['Winners', 'Temporary DOBs', 'Prizes', 'Birthday Months', 'Options', 'Admins'];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

// ── Winners Tab ───────────────────────────────────────────────────────────────
function WinnersTab() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';

  const [filters, setFilters] = useState({ from: firstOfMonth, to: today, status: 'All', lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [winners, setWinners] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('playedAt');
  const [sortDir, setSortDir] = useState('desc');

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(apiUrl('/api/admin/winners?' + params));
      const data = await res.json();
      setWinners(data.winners || []);
      setTotal(data.total || 0);
    } catch {
      setWinners([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchWinners(); }, []);

  const handleSort = (key) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...winners].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (av == null) av = '';
    if (bv == null) bv = '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handlePickup = async (id) => {
    await fetch(apiUrl('/api/admin/winners/' + id + '/pickup'), { method: 'PUT' });
    fetchWinners();
  };

  const exportCsv = () => {
    const headers = ['Played Date-Time', 'Winner', 'Employee #', 'Badge #', 'DOB Month', 'Temp DOB Month', 'Prize', 'Value', 'Status', 'Picked Up Date-Time'];
    const rows = sorted.map(w => [
      formatDateTime(w.playedAt), w.winner, w.employeeNumber, w.badgeNumber,
      w.dobMonth, w.tempDobMonth, w.prize, w.value, w.status, formatDateTime(w.pickedUpAt)
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'winners.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const Th = ({ label, sortK }) => (
    <th onClick={() => handleSort(sortK)}>
      {label}
      <span className={styles.sortArrow}>{sortKey === sortK ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}</span>
    </th>
  );

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>NQ Birthday Wheel: Winners</h2>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={exportCsv}>⬇ Export to Excel</button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Played Date From</label>
          <input className={styles.filterInput} type="date" value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>To</label>
          <input className={styles.filterInput} type="date" value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <select className={styles.filterInput} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option>All</option>
            <option>Pending</option>
            <option>Picked Up</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Last Name</label>
          <input className={styles.filterInput} placeholder="Last name…" value={filters.lastName}
            onChange={e => setFilters(f => ({ ...f, lastName: e.target.value }))} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>First Name</label>
          <input className={styles.filterInput} placeholder="First name…" value={filters.firstName}
            onChange={e => setFilters(f => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Employee #</label>
          <input className={styles.filterInput} placeholder="Emp #…" value={filters.employeeNumber}
            onChange={e => setFilters(f => ({ ...f, employeeNumber: e.target.value }))} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Badge #</label>
          <input className={styles.filterInput} placeholder="Badge #…" value={filters.badgeNumber}
            onChange={e => setFilters(f => ({ ...f, badgeNumber: e.target.value }))} />
        </div>
        <div className={styles.filterActions}>
          <button className={styles.btnPrimary} onClick={fetchWinners}>Search</button>
          <button className={styles.btnOutline} onClick={() => {
            setFilters({ from: firstOfMonth, to: today, status: 'All', lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
          }}>Clear</button>
        </div>
      </div>

      <p className={styles.resultCount}>({total} winner{total !== 1 ? 's' : ''} found)</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <Th label="Played Date-Time" sortK="playedAt" />
              <Th label="Winner" sortK="winner" />
              <Th label="Employee # / Badge #" sortK="employeeNumber" />
              <Th label="DOB Month" sortK="dobMonth" />
              <Th label="Temp DOB Month" sortK="tempDobMonth" />
              <Th label="Prize" sortK="prize" />
              <Th label="Value" sortK="value" />
              <th>Status</th>
              <Th label="Picked Up Date-Time" sortK="pickedUpAt" />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className={styles.emptyState}>Loading…</td></tr>
            )}
            {!loading && sorted.length === 0 && (
              <tr><td colSpan={10} className={styles.emptyState}>No winners found for the selected filters.</td></tr>
            )}
            {!loading && sorted.map(w => (
              <tr key={w.id}>
                <td>{formatDateTime(w.playedAt)}</td>
                <td>{w.winner}</td>
                <td>{w.employeeNumber}<br /><span style={{ color: '#5a8290', fontSize: 12 }}>{w.badgeNumber}</span></td>
                <td>{w.dobMonth}</td>
                <td>{w.tempDobMonth || '—'}</td>
                <td className={w.isJackpot || w.prize === 'Jackpot' ? styles.jackpot : ''}>{w.prize}</td>
                <td className={w.prize === 'Jackpot' ? styles.jackpot : ''}>{w.value > 0 ? `$${w.value}` : '—'}</td>
                <td>
                  <span className={`${styles.statusBadge} ${w.status === 'Picked Up' ? styles.statusPickedUp : styles.statusPending}`}>
                    {w.status}
                  </span>
                </td>
                <td>{formatDateTime(w.pickedUpAt)}</td>
                <td>
                  {w.status !== 'Picked Up' && (
                    <button className={styles.btnSmall} onClick={() => handlePickup(w.id)}>Picked Up Prize…</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Temp DOBs Tab ─────────────────────────────────────────────────────────────
function TempDobsTab() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeNumber: '', employeeName: '', originalMonth: '', tempMonth: '', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/temp-dobs')).then(r => r.json()).then(d => setEntries(d.tempDobs || []));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/temp-dobs'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const entry = await res.json();
      setEntries(prev => [...prev, entry]);
      setForm({ employeeNumber: '', employeeName: '', originalMonth: '', tempMonth: '', reason: '' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(apiUrl('/api/admin/temp-dobs/' + id), { method: 'DELETE' });
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Temporary DOBs</h2>
        <button className={styles.btnPrimary} onClick={() => setShowForm(v => !v)}>+ Add Temp DOB</button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Employee #</label>
              <input required className={styles.formInput} value={form.employeeNumber}
                onChange={e => setForm(f => ({ ...f, employeeNumber: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Employee Name</label>
              <input className={styles.formInput} value={form.employeeName}
                onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Original Month</label>
              <select className={styles.formInput} value={form.originalMonth}
                onChange={e => setForm(f => ({ ...f, originalMonth: e.target.value }))}>
                <option value="">— Select —</option>
                {MONTH_NAMES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Temp Month *</label>
              <select required className={styles.formInput} value={form.tempMonth}
                onChange={e => setForm(f => ({ ...f, tempMonth: e.target.value }))}>
                <option value="">— Select —</option>
                {MONTH_NAMES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reason</label>
              <input className={styles.formInput} value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>Save</button>
            <button type="button" className={styles.btnOutline} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee #</th><th>Employee Name</th><th>Original Month</th>
              <th>Temp Month</th><th>Reason</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={7} className={styles.emptyState}>No temporary DOBs configured.</td></tr>
            )}
            {entries.map(e => (
              <tr key={e.id}>
                <td>{e.employeeNumber}</td>
                <td>{e.employeeName}</td>
                <td>{e.originalMonth}</td>
                <td>{e.tempMonth}</td>
                <td>{e.reason}</td>
                <td>{formatDate(e.createdAt)}</td>
                <td><button className={styles.btnDanger} onClick={() => handleDelete(e.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Prizes Tab ────────────────────────────────────────────────────────────────
function PrizesTab() {
  const [prizes, setPrizes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', value: '', isJackpot: false });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPrizes = () => {
    fetch(apiUrl('/api/admin/prizes')).then(r => r.json()).then(d => setPrizes(d.prizes || []));
  };
  useEffect(() => { fetchPrizes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name: form.name, value: parseFloat(form.value) || 0, isJackpot: form.isJackpot };
      if (editId) {
        await fetch(apiUrl('/api/admin/prizes/' + editId), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch(apiUrl('/api/admin/prizes'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      fetchPrizes();
      setForm({ name: '', value: '', isJackpot: false });
      setEditId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, value: String(p.value), isJackpot: p.isJackpot });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await fetch(apiUrl('/api/admin/prizes/' + id), { method: 'DELETE' });
    fetchPrizes();
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Prizes</h2>
        <button className={styles.btnPrimary} onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ name: '', value: '', isJackpot: false }); }}>
          + Add Prize
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Prize Name *</label>
              <input required className={styles.formInput} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Value ($)</label>
              <input type="number" min="0" step="0.01" className={styles.formInput} value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            </div>
            <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.isJackpot}
                  onChange={e => setForm(f => ({ ...f, isJackpot: e.target.checked }))} />
                Jackpot Prize
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>{editId ? 'Update' : 'Save'}</button>
            <button type="button" className={styles.btnOutline} onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Prize Name</th><th>Value</th><th>Jackpot</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {prizes.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyState}>No prizes configured.</td></tr>
            )}
            {prizes.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td className={p.isJackpot ? styles.jackpot : ''}>{p.name}</td>
                <td>{p.value > 0 ? `$${p.value}` : '—'}</td>
                <td>{p.isJackpot ? '✔ Yes' : 'No'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.btnSmall} onClick={() => handleEdit(p)}>Edit</button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Birthday Months Tab ───────────────────────────────────────────────────────
function BirthdayMonthsTab() {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/api/admin/birthday-months')).then(r => r.json()).then(d => setMonths(d.birthdayMonths || []));
  }, []);

  const handleToggle = async (month, active) => {
    await fetch(apiUrl('/api/admin/birthday-months/' + month), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }),
    });
    setMonths(prev => prev.map(m => m.month === month ? { ...m, active } : m));
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Birthday Months</h2>
        <p style={{ fontSize: 13, color: '#5a8290' }}>Toggle months to enable or disable spinning for that month.</p>
      </div>
      <div className={styles.monthsGrid}>
        {months.map(m => (
          <div key={m.month} className={styles.monthCard}>
            <span>{m.name}</span>
            <label className={styles.toggle}>
              <input type="checkbox" checked={m.active} onChange={e => handleToggle(m.month, e.target.checked)} />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Options Tab ───────────────────────────────────────────────────────────────
function OptionsTab() {
  const [opts, setOpts] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/options')).then(r => r.json()).then(setOpts);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/options'), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts),
      });
      const updated = await res.json();
      setOpts(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (!opts) return <p className={styles.emptyState}>Loading…</p>;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Options</h2>
        {saved && <span style={{ color: '#1a6630', fontWeight: 600, fontSize: 13 }}>✔ Saved successfully</span>}
      </div>
      <form onSubmit={handleSave}>
        <div className={styles.optionsGrid}>
          <div className={styles.optionCard}>
            <div className={styles.optionLabel}>Site Name</div>
            <input className={styles.formInput} value={opts.siteName}
              onChange={e => setOpts(o => ({ ...o, siteName: e.target.value }))} />
          </div>
          <div className={styles.optionCard}>
            <div className={styles.optionLabel}>Max Spins Per Month</div>
            <input type="number" min="1" className={styles.formInput} value={opts.maxSpinsPerMonth}
              onChange={e => setOpts(o => ({ ...o, maxSpinsPerMonth: parseInt(e.target.value) || 1 }))} />
          </div>
          <div className={styles.optionCard}>
            <div className={styles.optionLabel}>Auto Pickup Days</div>
            <input type="number" min="1" className={styles.formInput} value={opts.autoPickupDays}
              onChange={e => setOpts(o => ({ ...o, autoPickupDays: parseInt(e.target.value) || 30 }))} />
          </div>
          <div className={styles.optionCard}>
            <div className={styles.optionLabel}>Allow Temporary DOB</div>
            <label className={styles.checkboxLabel} style={{ marginTop: 8 }}>
              <input type="checkbox" checked={opts.allowTempDob}
                onChange={e => setOpts(o => ({ ...o, allowTempDob: e.target.checked }))} />
              Enable temporary date of birth overrides
            </label>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? 'Saving…' : 'Save Options'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Admins Tab ────────────────────────────────────────────────────────────────
function AdminsTab() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Admin' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/admins')).then(r => r.json()).then(d => setAdmins(d.admins || []));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/admins'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const admin = await res.json();
      setAdmins(prev => [...prev, admin]);
      setForm({ name: '', email: '', role: 'Admin' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(apiUrl('/api/admin/admins/' + id), { method: 'DELETE' });
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Administrators</h2>
        <button className={styles.btnPrimary} onClick={() => setShowForm(v => !v)}>+ Add Admin</button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name *</label>
              <input required className={styles.formInput} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email *</label>
              <input required type="email" className={styles.formInput} value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <select className={styles.formInput} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option>Admin</option>
                <option>Super Admin</option>
                <option>Read Only</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>Save</button>
            <button type="button" className={styles.btnOutline} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Added</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {admins.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyState}>No administrators added.</td></tr>
            )}
            {admins.map(a => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td><span className={styles.statusBadge} style={{ background: '#d4edda', color: '#1a6630' }}>{a.role}</span></td>
                <td>{formatDate(a.createdAt)}</td>
                <td><button className={styles.btnDanger} onClick={() => handleDelete(a.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Winners');

  const NAV = [
    { label: 'Birthday\nWheel', icon: '🎡' },
    { label: 'Winners', icon: '🏆' },
    { label: 'Prizes', icon: '🎁' },
    { label: 'Reports', icon: '📊' },
  ];

  return (
    <div className={styles.screen}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Birthday Wheel</div>
        {NAV.map(n => (
          <div key={n.label} className={`${styles.navItem} ${n.label === 'Winners' && activeTab === 'Winners' ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}>{n.icon}</span>
            <span>{n.label.replace('\n', ' ')}</span>
          </div>
        ))}
      </aside>

      {/* Main workspace */}
      <div className={styles.workspace}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.topbarTitle}>Birthday Wheel Admin</h1>
            <span className={styles.topbarBadge}>KTEA</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.topbarUser}>Admin</span>
          </div>
        </header>

        {/* Tab bar */}
        <nav className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className={styles.content}>
          {activeTab === 'Winners' && <WinnersTab />}
          {activeTab === 'Temporary DOBs' && <TempDobsTab />}
          {activeTab === 'Prizes' && <PrizesTab />}
          {activeTab === 'Birthday Months' && <BirthdayMonthsTab />}
          {activeTab === 'Options' && <OptionsTab />}
          {activeTab === 'Admins' && <AdminsTab />}
        </main>
      </div>
    </div>
  );
}
