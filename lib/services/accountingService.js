import { supabase } from '@/lib/supabase/client';

// Todas las operaciones de este servicio viven en el schema `accounting`,
// separado del schema `public` que usan products/clients/sales.
const db = () => supabase.schema('accounting');

const mapMembership = (row) => ({
  organizationId: row.organization_id,
  userId: row.user_id,
  role: row.role,
  organizationName: row.organizations?.name || '',
});

const mapAccount = (row) => ({
  id: row.id,
  organizationId: row.organization_id,
  parentAccountId: row.parent_account_id,
  code: row.code,
  name: row.name,
  accountType: row.account_type,
  normalBalance: row.normal_balance,
  isActive: row.is_active,
});

const mapConcept = (row) => ({
  id: row.id,
  organizationId: row.organization_id,
  code: row.code,
  name: row.name,
  description: row.description || '',
  isActive: row.is_active,
});

const mapBalance = (row) => ({
  accountId: row.account_id,
  organizationId: row.organization_id,
  code: row.code,
  name: row.name,
  accountType: row.account_type,
  normalBalance: row.normal_balance,
  totalDebit: Number(row.total_debit || 0),
  totalCredit: Number(row.total_credit || 0),
  balance: Number(row.balance || 0),
});

const mapMovement = (row) => ({
  entryId: row.journal_entry_id,
  organizationId: row.organization_id,
  date: row.entry_date,
  description: row.entry_description,
  conceptId: row.concept_id,
  referenceType: row.reference_type,
  referenceId: row.reference_id,
  lineId: row.journal_entry_line_id,
  accountId: row.account_id,
  accountCode: row.account_code,
  accountName: row.account_name,
  lineDescription: row.line_description,
  debit: Number(row.debit || 0),
  credit: Number(row.credit || 0),
});

const mapEntry = (row) => ({
  id: row.id,
  organizationId: row.organization_id,
  fiscalPeriodId: row.fiscal_period_id,
  date: row.entry_date,
  description: row.description,
  conceptId: row.concept_id,
  conceptName: row.accounting_concepts?.name || '',
  referenceType: row.reference_type,
  referenceId: row.reference_id,
  status: row.status,
  createdBy: row.created_by,
  createdAt: row.created_at,
  voidedAt: row.voided_at,
  voidedBy: row.voided_by,
  reversalEntryId: row.reversal_entry_id,
});

const mapEntryLine = (row) => ({
  id: row.id,
  entryId: row.journal_entry_id,
  accountId: row.account_id,
  accountCode: row.accounts?.code || '',
  accountName: row.accounts?.name || '',
  description: row.description || '',
  debit: Number(row.debit || 0),
  credit: Number(row.credit || 0),
});

// Traduce errores del backend (RLS, RPC, constraints) a mensajes que el
// usuario pueda entender, sin ocultar el error si no reconocemos el patrón.
export const mapAccountingError = (error) => {
  const msg = (error?.message || '').toLowerCase();

  if (error?.code === 'PGRST116') {
    return 'No se encontró la información solicitada.';
  }
  if (msg.includes('permission denied') || msg.includes('policy') || msg.includes('permiso')) {
    return 'No tienes permisos para realizar esta operación.';
  }
  if (msg.includes('fiscal period') || msg.includes('período contable') || msg.includes('periodo contable') || msg.includes('open period')) {
    return 'No existe un período contable abierto para esta fecha.';
  }
  if (msg.includes('balance') || msg.includes('balanced') || msg.includes('balanceado')) {
    return 'El movimiento no está balanceado.';
  }
  if (msg.includes('inactive') || msg.includes('is_active') || msg.includes('activa')) {
    return 'La cuenta seleccionada no está activa.';
  }
  if (msg.includes('already') && (msg.includes('revers') || msg.includes('voided'))) {
    return 'Este asiento ya fue reversado.';
  }
  if (msg.includes('voided')) {
    return 'Este asiento ya fue reversado.';
  }

  return error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
};

export const accountingService = {
  organizations: {
    async listMemberships() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData?.user?.id;
      if (!userId) return [];

      const { data, error } = await db()
        .from('organization_members')
        .select('*, organizations(name)')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(mapMembership);
    },
  },

  accounts: {
    async list(organizationId) {
      const { data, error } = await db()
        .from('accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('code', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapAccount);
    },
  },

  concepts: {
    async list(organizationId) {
      const { data, error } = await db()
        .from('accounting_concepts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapConcept);
    },
  },

  balances: {
    async get(organizationId, accountId) {
      const { data, error } = await db()
        .from('account_balances')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('account_id', accountId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBalance(data) : null;
    },
  },

  movements: {
    async listByAccount(organizationId, accountId, { dateFrom, dateTo } = {}) {
      let query = db()
        .from('account_movements')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('account_id', accountId)
        .order('entry_date', { ascending: false });
      if (dateFrom) query = query.gte('entry_date', dateFrom);
      if (dateTo) query = query.lte('entry_date', dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapMovement);
    },
  },

  entries: {
    async list(organizationId, { status, dateFrom, dateTo } = {}) {
      let query = db()
        .from('journal_entries')
        .select('*, accounting_concepts(name)')
        .eq('organization_id', organizationId)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (dateFrom) query = query.gte('entry_date', dateFrom);
      if (dateTo) query = query.lte('entry_date', dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapEntry);
    },

    async getById(id) {
      const { data: entryRow, error: entryError } = await db()
        .from('journal_entries')
        .select('*, accounting_concepts(name)')
        .eq('id', id)
        .single();
      if (entryError) throw entryError;

      const { data: lineRows, error: linesError } = await db()
        .from('journal_entry_lines')
        .select('*, accounts(code, name)')
        .eq('journal_entry_id', id)
        .order('created_at', { ascending: true });
      if (linesError) throw linesError;

      return { ...mapEntry(entryRow), lines: (lineRows || []).map(mapEntryLine) };
    },

    async post({ organizationId, entryDate, description, conceptId, lines, referenceType, referenceId }) {
      const { data, error } = await db().rpc('post_journal_entry', {
        p_organization_id: organizationId,
        p_entry_date: entryDate,
        p_description: description,
        p_concept_id: conceptId || null,
        p_lines: lines.map((l) => ({
          account_id: l.accountId,
          description: l.description || null,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
        })),
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
      });
      if (error) throw error;
      return accountingService.entries.getById(data);
    },

    async reverse(id, { date, description } = {}) {
      const { data, error } = await db().rpc('reverse_journal_entry', {
        p_journal_entry_id: id,
        p_reversal_date: date || null,
        p_description: description || null,
      });
      if (error) throw error;
      return accountingService.entries.getById(data);
    },
  },
};
