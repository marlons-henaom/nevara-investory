'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FilePlus2 } from 'lucide-react';
import { useAccounting } from '@/lib/context/AccountingContext';
import { accountingService, mapAccountingError } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import AccountPicker from '@/components/accounting/AccountPicker';
import { useNotice } from '@/lib/hooks/useNotice';
import { COLORS } from '@/lib/utils/colors';
import { btnPrimary, btnGhost, inputStyle, labelStyle, iconBtn } from '@/lib/utils/styles';
import { money, todayISO } from '@/lib/utils/format';

const emptyLine = () => ({ accountId: '', description: '', debit: '', credit: '' });

export default function NuevoMovimientoPage() {
  const router = useRouter();
  const { organizationId } = useAccounting();
  const { notice, showNotice } = useNotice();

  const [accounts, setAccounts] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [entryDate, setEntryDate] = useState(todayISO());
  const [conceptId, setConceptId] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    Promise.all([accountingService.accounts.list(organizationId), accountingService.concepts.list(organizationId)]).then(
      ([a, c]) => {
        setAccounts(a);
        setConcepts(c);
      }
    );
  }, [organizationId]);

  const updateLine = (idx, patch) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const setDebit = (idx, value) => updateLine(idx, { debit: value, credit: value ? '' : lines[idx].credit });
  const setCredit = (idx, value) => updateLine(idx, { credit: value, debit: value ? '' : lines[idx].debit });

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;
  const hasDebitLine = lines.some((l) => Number(l.debit) > 0);
  const hasCreditLine = lines.some((l) => Number(l.credit) > 0);
  const allLinesHaveAccount = lines.every((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0));

  const canSubmit = description.trim() && hasDebitLine && hasCreditLine && allLinesHaveAccount && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const entry = await accountingService.entries.post({
        organizationId,
        entryDate,
        description: description.trim(),
        conceptId: conceptId || null,
        lines: lines
          .filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0))
          .map((l) => ({ accountId: l.accountId, description: l.description.trim(), debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
      });
      router.push(`/contabilidad/asientos/${entry.id}`);
    } catch (e) {
      showNotice(mapAccountingError(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ padding: 22 }}>
      <Notice notice={notice} />
      <SectionTitle icon={FilePlus2}>Nuevo movimiento</SectionTitle>

      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Fecha</label>
          <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div style={{ minWidth: 220 }}>
          <label style={labelStyle}>Concepto</label>
          <select value={conceptId} onChange={(e) => setConceptId(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            <option value="">Sin concepto</option>
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={labelStyle}>Descripción</label>
          <input
            placeholder="Descripción del movimiento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, padding: '0 4px' }}>
          <div style={{ flex: 2 }}>Cuenta</div>
          <div style={{ flex: 2 }}>Descripción</div>
          <div style={{ width: 130 }}>Débito</div>
          <div style={{ width: 130 }}>Crédito</div>
          <div style={{ width: 32 }} />
        </div>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <AccountPicker accounts={accounts} value={line.accountId} onChange={(v) => updateLine(idx, { accountId: v })} style={{ flex: 2 }} />
            <input
              placeholder="Opcional"
              value={line.description}
              onChange={(e) => updateLine(idx, { description: e.target.value })}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              type="number"
              placeholder="0"
              value={line.debit}
              onChange={(e) => setDebit(idx, e.target.value)}
              style={{ ...inputStyle, width: 130 }}
            />
            <input
              type="number"
              placeholder="0"
              value={line.credit}
              onChange={(e) => setCredit(idx, e.target.value)}
              style={{ ...inputStyle, width: 130 }}
            />
            <button
              onClick={() => removeLine(idx)}
              disabled={lines.length <= 2}
              style={{ ...iconBtn, opacity: lines.length <= 2 ? 0.4 : 1 }}
              title="Quitar línea"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button onClick={addLine} style={{ ...btnGhost, alignSelf: 'flex-start', marginTop: 4 }}>
          <Plus size={14} /> Agregar línea
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 24,
          padding: '12px 14px',
          background: isBalanced ? '#EAF4EC' : COLORS.snowWarm,
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <div>
          Total débitos: <strong>{money(totalDebit)}</strong>
        </div>
        <div>
          Total créditos: <strong>{money(totalCredit)}</strong>
        </div>
        <div style={{ color: isBalanced ? '#3D7A4A' : COLORS.danger, fontWeight: 600 }}>
          {isBalanced ? 'Balanceado' : 'No balanceado'}
        </div>
      </div>

      <button onClick={submit} disabled={!canSubmit} style={{ ...btnPrimary, opacity: canSubmit ? 1 : 0.5, padding: '10px 20px' }}>
        {saving ? 'Registrando…' : 'Registrar movimiento'}
      </button>
    </Card>
  );
}
