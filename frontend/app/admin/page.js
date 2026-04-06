"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';
import { apiUrl } from '../api';
import {
  SidebarLogoIcon,
  WinnersIcon,
  TempDobIcon,
  PrizesIcon,
  MonthsIcon,
  OptionsIcon,
  AdminsIcon,
  AdminShieldIcon,
} from './AdminIcons';

const TABS = [
  { id: 'Winners',         label: 'Winners',   icon: WinnersIcon },
  { id: 'Temporary DOBs',  label: 'Temp DOBs', icon: TempDobIcon },
  { id: 'Prizes',          label: 'Prizes',    icon: PrizesIcon },
  { id: 'Birthday Months', label: 'Months',    icon: MonthsIcon },
  { id: 'Options',         label: 'Options',   icon: OptionsIcon },
  { id: 'Admins',          label: 'Admins',    icon: AdminsIcon },
];

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

      <div className={`${styles.filterBar} ${styles.winnersFilterBar}`}>
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
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} placeholder="Last name…" value={filters.lastName}
              onChange={e => setFilters(f => ({ ...f, lastName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.lastName} onClick={() => setFilters(f => ({ ...f, lastName: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>First Name</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} placeholder="First name…" value={filters.firstName}
              onChange={e => setFilters(f => ({ ...f, firstName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.firstName} onClick={() => setFilters(f => ({ ...f, firstName: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Employee #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} placeholder="Emp #…" value={filters.employeeNumber}
              onChange={e => setFilters(f => ({ ...f, employeeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.employeeNumber} onClick={() => setFilters(f => ({ ...f, employeeNumber: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Badge #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} placeholder="Badge #…" value={filters.badgeNumber}
              onChange={e => setFilters(f => ({ ...f, badgeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.badgeNumber} onClick={() => setFilters(f => ({ ...f, badgeNumber: '' }))}>CLEAR</button>
          </div>
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
  const [form, setForm] = useState({ employeeNumber: '', firstName: '', lastName: '', badgeNumber: '', originalMonth: '', tempMonth: '', reason: '' });
  const [filters, setFilters] = useState({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [appliedFilters, setAppliedFilters] = useState({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTempDobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/temp-dobs'));
      const data = await res.json();
      setEntries(data.tempDobs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTempDobs();
  }, [fetchTempDobs]);

  const filteredEntries = entries.filter((entry) => {
    const lastName = (entry.lastName || '').toLowerCase();
    const firstName = (entry.firstName || '').toLowerCase();
    const employeeNumber = String(entry.employeeNumber || '');
    const badgeNumber = String(entry.badgeNumber || '');

    if (appliedFilters.lastName && !lastName.includes(appliedFilters.lastName.toLowerCase())) return false;
    if (appliedFilters.firstName && !firstName.includes(appliedFilters.firstName.toLowerCase())) return false;
    if (appliedFilters.employeeNumber && !employeeNumber.includes(appliedFilters.employeeNumber)) return false;
    if (appliedFilters.badgeNumber && !badgeNumber.includes(appliedFilters.badgeNumber)) return false;
    return true;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const employeeName = `${form.firstName} ${form.lastName}`.trim();
      const res = await fetch(apiUrl('/api/admin/temp-dobs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, employeeName }),
      });
      const entry = await res.json();
      setEntries(prev => [...prev, entry]);
      setForm({ employeeNumber: '', firstName: '', lastName: '', badgeNumber: '', originalMonth: '', tempMonth: '', reason: '' });
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
        <h2 className={styles.sectionTitle}>NQ Birthday Wheel Temporary Date of Births</h2>
        <button className={styles.btnPrimary} onClick={() => setShowForm(v => !v)}>+ New Temporary DOB</button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Last Name</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.lastName} onChange={e => setFilters(f => ({ ...f, lastName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.lastName} onClick={() => setFilters(f => ({ ...f, lastName: '' }))}>CLEAR</button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>First Name</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.firstName} onChange={e => setFilters(f => ({ ...f, firstName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.firstName} onClick={() => setFilters(f => ({ ...f, firstName: '' }))}>CLEAR</button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Employee #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.employeeNumber} onChange={e => setFilters(f => ({ ...f, employeeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.employeeNumber} onClick={() => setFilters(f => ({ ...f, employeeNumber: '' }))}>CLEAR</button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Badge #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.badgeNumber} onChange={e => setFilters(f => ({ ...f, badgeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.badgeNumber} onClick={() => setFilters(f => ({ ...f, badgeNumber: '' }))}>CLEAR</button>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className={styles.btnPrimary} onClick={() => setAppliedFilters({ ...filters })}>Search</button>
          <button className={styles.btnOutline} onClick={() => {
            const reset = { lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' };
            setFilters(reset);
            setAppliedFilters(reset);
          }}>Clear</button>
        </div>
      </div>

      <p className={styles.resultCount}>({filteredEntries.length} temp found)</p>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Employee #</label>
              <input required className={styles.formInput} value={form.employeeNumber}
                onChange={e => setForm(f => ({ ...f, employeeNumber: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input className={styles.formInput} value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input className={styles.formInput} value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Badge #</label>
              <input className={styles.formInput} value={form.badgeNumber}
                onChange={e => setForm(f => ({ ...f, badgeNumber: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>DOB Month</label>
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
              <th>Last Name</th><th>First Name</th><th>Employee #</th>
              <th>Badge #</th><th>DOB Month</th><th>Temp DOB Month</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className={styles.emptyState}>Loading…</td></tr>
            )}
            {!loading && filteredEntries.length === 0 && (
              <tr><td colSpan={7} className={styles.emptyState}>No temporary DOBs configured.</td></tr>
            )}
            {!loading && filteredEntries.map(e => (
              <tr key={e.id}>
                <td>{e.lastName || '—'}</td>
                <td>{e.firstName || '—'}</td>
                <td>{e.employeeNumber}</td>
                <td>{e.badgeNumber || '—'}</td>
                <td>{e.originalMonth || '—'}</td>
                <td>{e.tempMonth}</td>
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
  const [form, setForm] = useState({ name: '', value: '', isJackpot: false, year: String(new Date().getFullYear()) });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [yearFilter, setYearFilter] = useState('All');
  const [appliedYear, setAppliedYear] = useState('All');

  const fetchPrizes = () => {
    fetch(apiUrl('/api/admin/prizes')).then(r => r.json()).then(d => setPrizes(d.prizes || []));
  };
  useEffect(() => { fetchPrizes(); }, []);

  const availableYears = ['All', ...new Set(prizes.map(p => String(p.year || new Date().getFullYear()))).values()];
  const filteredPrizes = prizes.filter((prize) => appliedYear === 'All' || String(prize.year || new Date().getFullYear()) === appliedYear);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        value: parseFloat(form.value) || 0,
        isJackpot: form.isJackpot,
        year: parseInt(form.year, 10) || new Date().getFullYear(),
      };
      if (editId) {
        await fetch(apiUrl('/api/admin/prizes/' + editId), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch(apiUrl('/api/admin/prizes'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      fetchPrizes();
      setForm({ name: '', value: '', isJackpot: false, year: String(new Date().getFullYear()) });
      setEditId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, value: String(p.value), isJackpot: p.isJackpot, year: String(p.year || new Date().getFullYear()) });
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
        <h2 className={styles.sectionTitle}>NQ Birthday Wheel Prizes</h2>
        <button className={styles.btnPrimary} onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ name: '', value: '', isJackpot: false, year: String(new Date().getFullYear()) }); }}>
          {showForm ? 'Close' : 'Set Prizes'}
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Prize Year</label>
          <select className={styles.filterInput} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            {availableYears.map(year => <option key={year}>{year}</option>)}
          </select>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.btnPrimary} onClick={() => setAppliedYear(yearFilter)}>Search</button>
        </div>
      </div>

      <p className={styles.resultCount}>({filteredPrizes.length} prizes found)</p>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Prize Year</label>
              <input className={styles.formInput} type="number" value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
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
            <tr><th>Year</th><th>Prizes</th><th>Values</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredPrizes.length === 0 && (
              <tr><td colSpan={4} className={styles.emptyState}>No prizes configured.</td></tr>
            )}
            {filteredPrizes.map((p) => (
              <tr key={p.id}>
                <td>{p.year || new Date().getFullYear()}</td>
                <td className={p.isJackpot ? styles.jackpot : ''}>{p.name}</td>
                <td>{p.value > 0 ? `$${p.value}` : '—'}</td>
                <td>
                  <div className={styles.rowActionsInline}>
                    <button className={styles.btnSmall} onClick={() => handleEdit(p)}>Edit</button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [members, setMembers] = useState([]);
  const [memberTotal, setMemberTotal] = useState(0);

  useEffect(() => {
    fetch(apiUrl('/api/admin/birthday-months')).then(r => r.json()).then(d => setMonths(d.birthdayMonths || []));
  }, []);

  useEffect(() => {
    fetch(apiUrl('/api/admin/birthday-month-members?month=' + selectedMonth))
      .then(r => r.json())
      .then(d => {
        setMembers(d.members || []);
        setMemberTotal(d.total || 0);
      });
  }, [selectedMonth]);

  const handleToggle = async (month, active) => {
    await fetch(apiUrl('/api/admin/birthday-months/' + month), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }),
    });
    setMonths(prev => prev.map(m => m.month === month ? { ...m, active } : m));
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>NQ Birthday Wheel: Birthday Months</h2>
        <button className={styles.btnOutline} onClick={() => window.print()}>Print List</button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Birthday Month</label>
          <select className={styles.filterInput} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}>
            {months.map(m => <option key={m.month} value={m.month}>{m.name}</option>)}
          </select>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.btnPrimary} onClick={() => setSelectedMonth(selectedMonth)}>Search</button>
        </div>
      </div>

      <p className={styles.resultCount}>({memberTotal} birthdays found)</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Last Name</th><th>First Name</th><th>Employee #</th><th>Badge #</th><th>Prize</th><th>Signature</th></tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan={6} className={styles.emptyState}>No team members found for this month.</td></tr>
            )}
            {members.map(member => (
              <tr key={member.id}>
                <td>{member.lastName}</td>
                <td>{member.firstName}</td>
                <td>{member.employeeNumber}</td>
                <td>{member.badgeNumber}</td>
                <td>{member.prize || '—'}</td>
                <td><span className={styles.signatureLine} /></td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} type="button" onClick={() => window.open('https://github.com/hagatamudievoke/BirthdaywheelKTEA', '_blank', 'noopener,noreferrer')}>Documentation</button>
          {saved && <span style={{ color: '#1a6630', fontWeight: 600, fontSize: 13 }}>✔ Saved successfully</span>}
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div className={styles.optionPanel}>
          <div className={styles.optionRow}>
            <div className={styles.optionLabelWide}>Suspend App</div>
            <select className={styles.optionSelect} value={opts.suspendApp ? 'Yes' : 'No'} onChange={e => setOpts(o => ({ ...o, suspendApp: e.target.value === 'Yes' }))}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <div className={styles.optionRowTop}>
            <div className={styles.optionLabelWide}>Suspension Message:</div>
            <textarea
              className={styles.messageArea}
              value={opts.suspensionMessage || ''}
              onChange={e => setOpts(o => ({ ...o, suspensionMessage: e.target.value }))}
            />
          </div>

          <div className={styles.noteBlock}>
            <strong>NOTES</strong>
            <p>* Upon setting Suspend App to "Yes", users are provided with a message when they attempt to use the app, and are prevented from playing the app.</p>
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
  const [form, setForm] = useState({ name: '', firstName: '', lastName: '', employeeNumber: '', badgeNumber: '', jobTitle: '', department: '', phone: '', email: '', role: 'Admin', level: '1' });
  const [filters, setFilters] = useState({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [appliedFilters, setAppliedFilters] = useState({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/admins')).then(r => r.json()).then(d => setAdmins(d.admins || []));
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    if (appliedFilters.lastName && !(admin.lastName || '').toLowerCase().includes(appliedFilters.lastName.toLowerCase())) return false;
    if (appliedFilters.firstName && !(admin.firstName || '').toLowerCase().includes(appliedFilters.firstName.toLowerCase())) return false;
    if (appliedFilters.employeeNumber && !(admin.employeeNumber || '').includes(appliedFilters.employeeNumber)) return false;
    if (appliedFilters.badgeNumber && !(admin.badgeNumber || '').includes(appliedFilters.badgeNumber)) return false;
    return true;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/admins'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const admin = await res.json();
      setAdmins(prev => [...prev, admin]);
      setForm({ name: '', firstName: '', lastName: '', employeeNumber: '', badgeNumber: '', jobTitle: '', department: '', phone: '', email: '', role: 'Admin', level: '1' });
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
        <h2 className={styles.sectionTitle}>NQ Birthday Wheel: Admins</h2>
        <button className={styles.btnPrimary} onClick={() => setShowForm(v => !v)}>+ New Admin</button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Last Name</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.lastName} onChange={e => setFilters(f => ({ ...f, lastName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.lastName} onClick={() => setFilters(f => ({ ...f, lastName: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>First Name</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.firstName} onChange={e => setFilters(f => ({ ...f, firstName: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.firstName} onClick={() => setFilters(f => ({ ...f, firstName: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Employee #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.employeeNumber} onChange={e => setFilters(f => ({ ...f, employeeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.employeeNumber} onClick={() => setFilters(f => ({ ...f, employeeNumber: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Badge #</label>
          <div className={styles.filterInputRow}>
            <input className={styles.filterInput} value={filters.badgeNumber} onChange={e => setFilters(f => ({ ...f, badgeNumber: e.target.value }))} />
            <button type="button" className={styles.clearTiny} disabled={!filters.badgeNumber} onClick={() => setFilters(f => ({ ...f, badgeNumber: '' }))}>CLEAR</button>
          </div>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.btnPrimary} onClick={() => setAppliedFilters({ ...filters })}>Search</button>
        </div>
      </div>

      <p className={styles.resultCount}>({filteredAdmins.length} admins found)</p>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name *</label>
              <input required className={styles.formInput} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input className={styles.formInput} value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input className={styles.formInput} value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Employee #</label>
              <input className={styles.formInput} value={form.employeeNumber}
                onChange={e => setForm(f => ({ ...f, employeeNumber: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Badge #</label>
              <input className={styles.formInput} value={form.badgeNumber}
                onChange={e => setForm(f => ({ ...f, badgeNumber: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Job Title</label>
              <input className={styles.formInput} value={form.jobTitle}
                onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Department</label>
              <input className={styles.formInput} value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone</label>
              <input className={styles.formInput} value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email *</label>
              <input required type="email" className={styles.formInput} value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Level</label>
              <select className={styles.formInput} value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
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
            <tr><th>Name</th><th>Employee # / Badge #</th><th>Job Title / Department</th><th>Phone #</th><th>Email</th><th>Level</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 && (
              <tr><td colSpan={7} className={styles.emptyState}>No administrators added.</td></tr>
            )}
            {filteredAdmins.map(a => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td className={styles.compactCell}>{a.employeeNumber || '—'}<br /><span className={styles.mutedSmall}>{a.badgeNumber || '—'}</span></td>
                <td className={styles.compactCell}>{a.jobTitle || '—'}<br /><span className={styles.mutedSmall}>{a.department || '—'}</span></td>
                <td>{a.phone || '—'}</td>
                <td>{a.email}</td>
                <td><span className={styles.levelPill}>{a.level || '1'}</span></td>
                <td><button className={styles.btnDanger} onClick={() => handleDelete(a.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Login Screen ────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        return;
      }
      onSuccess(data.name);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginScreen}>
      {/* Sidebar */}
      <aside className={styles.loginSidebar}>
        <div className={styles.loginSidebarLogo}>
          <span className={styles.loginSidebarLogoIcon}><SidebarLogoIcon /></span>
          <span className={styles.loginSidebarLogoText}>Birthday Wheel</span>
        </div>
        <div className={styles.loginSidebarItem}>
          <span className={styles.loginSidebarItemIcon}><AdminShieldIcon /></span>
          <span>Admin</span>
        </div>
      </aside>

      {/* Workspace */}
      <div className={styles.loginWorkspace}>
        <header className={styles.loginTopbar}>
          <h1>Birthday Wheel Admin</h1>
          <span className={styles.loginBadge}>KTEA</span>
        </header>

        <main className={styles.loginCanvas}>
          <div className={styles.loginCard}>
            <p className={styles.loginLabel}>Admin Access</p>
            <h2 className={styles.loginTitle}>Admin Sign In</h2>
            <p className={styles.loginSubtitle}>Enter your admin credentials to access the dashboard.</p>

            {error && <div className={styles.loginError}>{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <label className={styles.loginFieldLabel} htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                className={styles.loginInput}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="admin"
              />

              <label className={styles.loginFieldLabel} htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className={styles.loginInput}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
              />

              <button
                className={styles.loginBtn}
                type="submit"
                disabled={loading || !username.trim() || !password.trim()}
              >
                {loading ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTab] = useState('Winners');

  useEffect(() => {
    const saved = sessionStorage.getItem('adminAuthed');
    if (saved) { setAdminName(saved); setLoggedIn(true); }
  }, []);

  if (!loggedIn) {
    return <AdminLogin onSuccess={(name) => { setAdminName(name); setLoggedIn(true); }} />;
  }

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h1 className={styles.topbarTitle}>Birthday Wheel Admin</h1>
          <span className={styles.topbarBadge}>KTEA</span>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.topbarUser}>👤 {adminName}</span>
          <button
            className={styles.signOutBtn}
            onClick={() => { sessionStorage.removeItem('adminAuthed'); setLoggedIn(false); setAdminName(''); }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className={styles.adminBody}>
        <aside className={styles.sidebar}>
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.sideItem} ${activeTab === tab.id ? styles.sideItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.sideIcon}><TabIcon /></span>
                <span className={styles.sideLabel}>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <div className={styles.workspace}>
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
    </div>
  );
}
