'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Undo2, ArrowRight } from 'lucide-react';
import { accountingService, mapAccountingError } from '@/lib/services/accountingService';
import Card from '@/components/Card';
import SectionTitle from '@/components/SectionTitle';
import Notice from '@/components/Notice';
import { useNotice } from '@/lib/hooks/useNotice';
import { COLORS, journalEntryStatusColors } from '@/lib/utils/colors';
import { btnDanger } from '@/lib/utils/styles';
import { money, fmtDate } from '@/lib/utils/format';

export default function AsientoDetailPage() {
  const { id } = useParams();
  const { notice, showNotice } = useNotice();
  const [entry, setEntry] = useState(null);
  const [originalEntry, setOriginalEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reversing, setReversing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.entries.getById(id);
      setEntry(data);

      if (data.referenceId) {
        const candidate = await accountingService.entries.getById(data.referenceId).catch(() => null);
        setOriginalEntry(candidate && candidate.reversalEntryId === data.id ? candidate : null);
      } else {
        setOriginalEntry(null);
      }
    } catch (e) {
      setError(mapAccountingError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const reverse = async () => {
    if (!confirm('¿Reversar este asiento? Se creará un nuevo asiento de reversión y este quedará marcado como VOIDED. El historial contable se conserva, no se elimina nada.')) {
      return;
    }
    setReversing(true);
    try {
      await accountingService.entries.reverse(id);
      showNotice('Asiento reversado correctamente');
      await load();
    } catch (e) {
      showNotice(mapAccountingError(e), 'error');
    } finally {
      setReversing(false);
    }
  };

  if (loading) return <Card style={{ padding: 22, color: COLORS.inkSoft }}>Cargando…</Card>;

  if (error || !entry) {
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ color: COLORS.danger, fontSize: 14 }}>{error || 'Asiento no encontrado.'}</div>
      </Card>
    );
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);

  return (
    <Card style={{ padding: 22 }}>
      <Notice notice={notice} />
      <SectionTitle icon={FileText}>{entry.description}</SectionTitle>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
        <Field label="Fecha" value={fmtDate(entry.date)} />
        <Field label="Concepto" value={entry.conceptName || '—'} />
        <div>
          <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Estado</div>
          <span style={{ fontSize: 13, padding: '4px 10px', borderRadius: 999, ...journalEntryStatusColors(entry.status) }}>{entry.status}</span>
        </div>
      </div>

      {entry.reversalEntryId && (
        <RelationBanner label="Reversado por" targetId={entry.reversalEntryId} linkLabel="Ver reversión" />
      )}
      {originalEntry && (
        <RelationBanner label="Reversión de" targetId={originalEntry.id} linkLabel="Ver asiento original" />
      )}

      <div style={{ marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: COLORS.inkSoft, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              <th style={{ padding: '8px 6px' }}>Cuenta</th>
              <th style={{ padding: '8px 6px' }}>Descripción</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Débito</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Crédito</th>
            </tr>
          </thead>
          <tbody>
            {entry.lines.map((l) => (
              <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.pink}` }}>
                <td style={{ padding: '10px 6px' }}>{l.accountCode} - {l.accountName}</td>
                <td style={{ padding: '10px 6px', color: COLORS.inkSoft }}>{l.description}</td>
                <td style={{ padding: '10px 6px', textAlign: 'right' }}>{l.debit > 0 ? money(l.debit) : ''}</td>
                <td style={{ padding: '10px 6px', textAlign: 'right' }}>{l.credit > 0 ? money(l.credit) : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${COLORS.mauve}`, fontWeight: 600 }}>
              <td style={{ padding: '10px 6px' }} colSpan={2}>Total</td>
              <td style={{ padding: '10px 6px', textAlign: 'right' }}>{money(totalDebit)}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right' }}>{money(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {entry.status === 'POSTED' && (
        <button onClick={reverse} disabled={reversing} style={{ ...btnDanger, opacity: reversing ? 0.6 : 1 }}>
          <Undo2 size={15} /> {reversing ? 'Reversando…' : 'Reversar'}
        </button>
      )}
    </Card>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: COLORS.ink }}>{value}</div>
    </div>
  );
}

function RelationBanner({ label, targetId, linkLabel }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: COLORS.snowWarm,
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 14,
      }}
    >
      <span style={{ color: COLORS.inkSoft }}>{label}:</span>
      <span style={{ fontFamily: 'monospace' }}>#{targetId.slice(0, 8)}</span>
      <Link href={`/contabilidad/asientos/${targetId}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: COLORS.mauveDark, fontWeight: 600, textDecoration: 'none' }}>
        {linkLabel} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
