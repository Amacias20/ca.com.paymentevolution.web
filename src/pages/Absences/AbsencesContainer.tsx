import type { GridPageChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import { AbsenceService } from '../../services/api/AbsenceService';
import DeactivateDialog from '../../components/Dialogs/DeactivateDialog';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { toastError, toastSuccess } from '../../utils/toastUtils';
import type { SortDescriptor } from '@progress/kendo-data-query';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Loader } from '@progress/kendo-react-indicators';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const PAGE_SIZE = 10;

const StatusCell = ({ dataItem, t }: { dataItem: any; t: (k: string) => string }) => {
  const s = (dataItem.status ?? '').toString().toLowerCase();
  const cls = s === 'active' || s === '1' || s === 'approved' ? 'active' : s === 'pending' ? 'pending' : 'inactive';
  const label = cls === 'active' ? t('common.approved') : cls === 'pending' ? t('common.pending') : t('common.rejected');
  return <td><span className={`status-badge ${cls}`}>{label}</span></td>;
};

const DateCell = ({ dataItem, field }: { dataItem: any; field: string }) => {
  const val = dataItem[field];
  if (!val) return <td style={{ color: 'var(--text-muted)' }}>—</td>;
  const formatted = moment(val).isValid() ? moment(val).format('MMM D, YYYY') : val;
  return <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{formatted}</td>;
};

const ActionsCell = ({ dataItem, onEdit, onDelete }: { dataItem: any; onEdit: (i: any) => void; onDelete: (i: any) => void }) => (
  <td style={{ verticalAlign: 'middle' }}>
    <div style={{ display: 'flex', gap: '0.375rem' }}>
      <button className="action-btn edit" title="Edit" onClick={() => onEdit(dataItem)}>✏️</button>
      <button className="action-btn delete" title="Delete" onClick={() => onDelete(dataItem)}>🗑️</button>
    </div>
  </td>
);

const exportToExcel = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => r[h] ?? ''));
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

const AbsencesContainer = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ skip: 0, take: PAGE_SIZE });
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [filterStatus, setFilterStatus] = useState<{ text: string; value: string }>({ text: '', value: '' });
  const [applied, setApplied] = useState({ start: null as Date | null, end: null as Date | null, status: '' });
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  moment.locale(i18n.language === 'fr' ? 'fr' : i18n.language === 'es' ? 'es' : 'en');

  const STATUS_OPTIONS = [
    { text: t('employees.filters.all') || 'All', value: '' },
    { text: t('common.approved'), value: 'APPROVED' },
    { text: t('common.pending'), value: 'PENDING' },
    { text: t('common.rejected'), value: 'REJECTED' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = Math.floor(page.skip / page.take) + 1;
      const response = await AbsenceService.getAbsences(currentPage, page.take);
      const payload = response.data?.data;
      let rows: any[] = payload?.data ?? payload?.items ?? [];
      
      if (applied.start && applied.end) {
        rows = rows.filter(d => {
          if (!d.startDate) return true;
          const date = moment(d.startDate);
          return date.isSameOrAfter(applied.start!, 'day') && date.isSameOrBefore(applied.end!, 'day');
        });
      }
      
      if (applied.status) rows = rows.filter(r => r.status?.toUpperCase() === applied.status);
      
      setData(rows);
      setTotal(payload?.totalRecords ?? payload?.totalCount ?? 0);
    } catch { toastError(t('absences.title') + ': error loading data'); }
    finally { setLoading(false); }
  }, [page, applied, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage({ skip: 0, take: PAGE_SIZE }); setApplied({ start: dateRange.start, end: dateRange.end, status: filterStatus.value }); };
  const handleClear  = () => { setDateRange({ start: null, end: null }); setFilterStatus(STATUS_OPTIONS[0]); setApplied({ start: null, end: null, status: '' }); setPage({ skip: 0, take: PAGE_SIZE }); };
  const handleEdit   = (item: any) => navigate(`/absences/${item.idAbsence}/edit`);
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try { 
      await AbsenceService.deleteAbsence(itemToDelete.idAbsence); 
      toastSuccess('Deleted'); 
      setItemToDelete(null);
      fetchData(); 
    } catch { 
      toastError('Error deleting'); 
      setItemToDelete(null);
    }
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-card">
        <div className="page-header-card-top">
          <div>
            <div className="page-title"><div className="page-title-icon">📅</div>{t('absences.title')}</div>
            <p className="page-subtitle">{t('absences.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button id="absences-filter-toggle" className={`filter-toggle-btn${showFilters ? ' active' : ''}`} onClick={() => setShowFilters(v => !v)}>
              <span className="filter-toggle-icon" style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              {t('common.filters')}
            </button>
            <Button fillMode="outline" themeColor="base" title={t('common.exportExcel')} onClick={() => exportToExcel(data, 'absences')} style={{ minWidth: 36, height: 36, padding: '0 10px' }}>📥</Button>
            <Button id="absence-add" themeColor="primary" fillMode="solid" onClick={() => navigate('/absences/new')}>+ {t('absences.addButton')}</Button>
          </div>
        </div>
        <div className={`filter-accordion${showFilters ? ' open' : ''}`}>
          <div className="filter-accordion-inner">
            <div className="filter-bar-separator" />
            <div className="filter-bar-fields">
              <div className="filter-field" style={{ minWidth: 300 }}>
                <label className="filter-label">{t('absences.dateRange') || 'Date Range'}</label>
                <DateRangePicker
                  value={{ start: dateRange.start, end: dateRange.end }}
                  onChange={e => setDateRange({ start: e.value.start ?? null, end: e.value.end ?? null })}
                  startDateInputSettings={{ label: t('absences.dateFrom') || 'From' }}
                  endDateInputSettings={{ label: t('absences.dateTo') || 'To' }}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="filter-field">
                <label className="filter-label">{t('absences.columns.status') || 'Status'}</label>
                <DropDownList data={STATUS_OPTIONS} textField="text" dataItemKey="value" value={filterStatus} onChange={e => setFilterStatus(e.value)} style={{ width: '100%' }} />
              </div>
              <div className="filter-bar-actions">
                <Button themeColor="primary" fillMode="solid" onClick={handleSearch}>🔍 {t('employees.filters.search')}</Button>
                <Button themeColor="base" fillMode="outline" onClick={handleClear}>✖ {t('employees.filters.clear')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ position: 'relative' }}>
        <div className="section-card-body no-pad" style={{ position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', opacity: 0.75, zIndex: 10, borderRadius: 12 }}>
              <Loader size="large" themeColor="primary" />
            </div>
          )}
          <Grid
            data={data} total={total} skip={page.skip} take={page.take}
            pageable={{ pageSizes: [10, 25, 50], info: true, buttonCount: 5 }}
            sortable sort={sort} filterable={false}
            onPageChange={(e: GridPageChangeEvent) => setPage({ skip: e.page.skip, take: e.page.take })}
            onSortChange={(e: GridSortChangeEvent) => setSort(e.sort)}
            scrollable="none" style={{ border: 'none', width: '100%' }}
          >
            <GridColumn field="idAbsence" title={t('absences.columns.id') || 'ID'} width="80px" />
            <GridColumn field="employeeName" title={t('absences.columns.employee') || 'Employee'} />
            <GridColumn field="absenceTypeName" title={t('absences.columns.type') || 'Type'} />
            <GridColumn field="startDate" title={t('absences.columns.startDate') || 'Start Date'} cells={{ data: (p) => <DateCell dataItem={p.dataItem} field="startDate" /> }} />
            <GridColumn field="endDate" title={t('absences.columns.endDate') || 'End Date'} cells={{ data: (p) => <DateCell dataItem={p.dataItem} field="endDate" /> }} />
            <GridColumn field="status"    title={t('absences.columns.status') || 'Status'} width="130px" cells={{ data: (p) => <StatusCell dataItem={p.dataItem} t={t} /> }} />
            <GridColumn title={t('common.actions')} width="100px" sortable={false} cells={{ data: (p) => <ActionsCell dataItem={p.dataItem} onEdit={handleEdit} onDelete={handleDeleteClick} /> }} />
          </Grid>
        </div>
      </div>
      
      {itemToDelete && (
        <DeactivateDialog
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
          title={t('absences.actions.confirmDeleteTitle', 'Delete Absence')}
          message={t('absences.actions.confirmDeleteMessage', `Are you sure you want to delete this absence?`)}
        />
      )}
    </div>
  );
};

export default AbsencesContainer;
