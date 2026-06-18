import type { GridPageChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import { toastError, toastSuccess } from '../../utils/toastUtils';
import type { SortDescriptor } from '@progress/kendo-data-query';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { UserService } from '../../services/api/UserService';
import { Loader } from '@progress/kendo-react-indicators';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DeactivateDialog from '../../components/Dialogs/DeactivateDialog';

const PAGE_SIZE = 10;

const StatusCell = ({ dataItem, t }: { dataItem: any; t: (k: string) => string }) => {
  const s = (dataItem.status ?? '').toString().toLowerCase();
  const cls = s === 'active' || s === '1' ? 'active' : 'inactive';
  return <td><span className={`status-badge ${cls}`}>{cls === 'active' ? t('common.active') : t('common.inactive')}</span></td>;
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

const UsersContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ skip: 0, take: PAGE_SIZE });
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filterUsername, setFilterUsername] = useState('');
  const [filterStatus, setFilterStatus] = useState<{ text: string; value: string }>({ text: '', value: '' });
  const [applied, setApplied] = useState({ username: '', status: '' });
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const STATUS_OPTIONS = [
    { text: t('employees.filters.all'), value: '' },
    { text: t('common.active'), value: 'ACTIVE' },
    { text: t('common.inactive'), value: 'INACTIVE' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = Math.floor(page.skip / page.take) + 1;
      const response = await UserService.getUsers(currentPage, page.take);
      const payload = response.data?.data;
      let rows: any[] = payload?.data ?? payload?.items ?? [];
      if (applied.username) rows = rows.filter(r => r.username?.toLowerCase().includes(applied.username.toLowerCase()));
      if (applied.status)   rows = rows.filter(r => r.status?.toUpperCase() === applied.status);
      setData(rows);
      setTotal(payload?.totalRecords ?? payload?.totalCount ?? 0);
    } catch { toastError(t('users.title') + ': error loading data'); }
    finally { setLoading(false); }
  }, [page, applied, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage({ skip: 0, take: PAGE_SIZE }); setApplied({ username: filterUsername, status: filterStatus.value }); };
  const handleClear  = () => { setFilterUsername(''); setFilterStatus(STATUS_OPTIONS[0]); setApplied({ username: '', status: '' }); setPage({ skip: 0, take: PAGE_SIZE }); };
  const handleEdit   = (item: any) => navigate(`/users/${item.idUser ?? item.userId ?? item.id}/edit`);
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try { 
      await UserService.deleteUser(itemToDelete.idUser ?? itemToDelete.userId ?? itemToDelete.id); 
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
            <div className="page-title"><div className="page-title-icon">🔐</div>{t('users.title')}</div>
            <p className="page-subtitle">{t('users.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button id="users-filter-toggle" className={`filter-toggle-btn${showFilters ? ' active' : ''}`} onClick={() => setShowFilters(v => !v)}>
              <span className="filter-toggle-icon" style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              {t('common.filters')}
            </button>
            <Button fillMode="outline" themeColor="base" title={t('common.exportExcel')} onClick={() => exportToExcel(data, 'users')} style={{ minWidth: 36, height: 36, padding: '0 10px' }}>📥</Button>
            <Button id="user-add" themeColor="primary" fillMode="solid" onClick={() => navigate('/users/new')}>+ {t('users.addButton')}</Button>
          </div>
        </div>
        <div className={`filter-accordion${showFilters ? ' open' : ''}`}>
          <div className="filter-accordion-inner">
            <div className="filter-bar-separator" />
            <div className="filter-bar-fields">
              <div className="filter-field">
                <label className="filter-label">{t('users.columns.username')}</label>
                <Input value={filterUsername} onChange={e => setFilterUsername(String(e.value ?? ''))} placeholder={t('users.columns.username')} style={{ width: '100%' }} />
              </div>
              <div className="filter-field">
                <label className="filter-label">{t('users.columns.status')}</label>
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
            <GridColumn field="idUser"   title={t('users.columns.id')}       width="80px" />
            <GridColumn field="username" title={t('users.columns.username')} />
            <GridColumn field="status"   title={t('users.columns.status')}   width="130px" cells={{ data: (p) => <StatusCell dataItem={p.dataItem} t={t} /> }} />
            <GridColumn title={t('common.actions')} width="100px" sortable={false} cells={{ data: (p) => <ActionsCell dataItem={p.dataItem} onEdit={handleEdit} onDelete={handleDeleteClick} /> }} />
          </Grid>
        </div>
      </div>
      
      {itemToDelete && (
        <DeactivateDialog
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
          title={t('users.actions.confirmDeleteTitle', 'Delete User')}
          message={t('users.actions.confirmDeleteMessage', `Are you sure you want to delete ${itemToDelete.username}?`)}
        />
      )}
    </div>
  );
};

export default UsersContainer;