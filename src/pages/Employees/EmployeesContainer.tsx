import type { SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import type { GridPageChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import { EmployeeService } from '../../services/api/EmployeeService';
import { toastError, toastSuccess } from '../../utils/toastUtils';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Loader } from '@progress/kendo-react-indicators';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DeactivateDialog from '../../components/Dialogs/DeactivateDialog';


const PAGE_SIZE = 10;

const StatusCell = ({ dataItem, t }: { dataItem: any; t: (k: string) => string }) => {
  const status = (dataItem.status ?? '').toString().toLowerCase();
  const cls = status === 'active' ? 'active' : status === 'pending' ? 'pending' : 'inactive';
  const label = cls === 'active' ? t('common.active') : cls === 'pending' ? t('common.pending') : t('common.inactive');
  return <td style={{ verticalAlign: 'middle' }}><span className={`status-badge ${cls}`}>{label}</span></td>;
};

const DateCell = ({ dataItem }: { dataItem: any }) => (
  <td style={{ verticalAlign: 'middle' }}>
    {dataItem.hireDate ? new Date(dataItem.hireDate).toLocaleDateString() : '-'}
  </td>
);

const ActionsCell = ({ dataItem, onEdit, onDelete }: { dataItem: any; onEdit: (i: any) => void; onDelete: (i: any) => void }) => (
  <td style={{ verticalAlign: 'middle' }}>
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
      <button
        className="action-btn edit"
        title="Edit"
        onClick={() => onEdit(dataItem)}
      >✏️</button>
      <button
        className="action-btn delete"
        title="Delete"
        onClick={() => onDelete(dataItem)}
      >🗑️</button>
    </div>
  </td>
);

const exportToExcel = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
        return new Date(val).toLocaleDateString();
      }
      return val ?? '';
    })
  );
  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const EmployeesContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ skip: 0, take: PAGE_SIZE });
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [filter] = useState<CompositeFilterDescriptor | null>(null);

  const [filterFirstName, setFilterFirstName] = useState('');
  const [filterLastName, setFilterLastName] = useState('');
  const [filterStatus, setFilterStatus] = useState<{ text: string; value: string }>({ text: t('employees.filters.all'), value: '' });
  const [appliedFilters, setAppliedFilters] = useState({ firstName: '', lastName: '', status: '' });
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const STATUS_OPTIONS = [
    { text: t('employees.filters.all'), value: '' },
    { text: t('common.active'), value: 'ACTIVE' },
    { text: t('common.inactive'), value: 'INACTIVE' },
  ];

  const [showFilters, setShowFilters] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = Math.floor(page.skip / page.take) + 1;
      const response = await EmployeeService.getEmployees(currentPage, page.take);
      const payload = response.data?.data;
      let rows: any[] = payload?.data ?? [];

      if (appliedFilters.firstName) rows = rows.filter(r => r.firstName?.toLowerCase().includes(appliedFilters.firstName.toLowerCase()));
      if (appliedFilters.lastName)  rows = rows.filter(r => r.lastName?.toLowerCase().includes(appliedFilters.lastName.toLowerCase()));
      if (appliedFilters.status)    rows = rows.filter(r => r.status?.toUpperCase() === appliedFilters.status);

      setData(rows);
      setTotal(payload?.totalRecords ?? 0);
    } catch {
      toastError(t('employees.title') + ': error loading data');
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setPage({ skip: 0, take: PAGE_SIZE });
    setAppliedFilters({
      firstName: filterFirstName,
      lastName: filterLastName,
      status: filterStatus.value,
    });
  };

  const handleClear = () => {
    setFilterFirstName('');
    setFilterLastName('');
    setFilterStatus({ text: t('employees.filters.all'), value: '' });
    setAppliedFilters({ firstName: '', lastName: '', status: '' });
    setPage({ skip: 0, take: PAGE_SIZE });
  };

  const handleEdit = (item: any) => navigate(`/employees/${item.idEmployee}/edit`);

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await EmployeeService.deleteEmployee(itemToDelete.idEmployee);
      toastSuccess(t('common.delete') + ' OK');
      setItemToDelete(null);
      fetchData();
    } catch {
      toastError('Error deleting employee');
      setItemToDelete(null);
    }
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-card">
        <div className="page-header-card-top">
          <div>
            <div className="page-title">
              <div className="page-title-icon">👥</div>
              {t('employees.title')}
            </div>
            <p className="page-subtitle">{t('employees.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              id="employee-filter-toggle"
              className={`filter-toggle-btn${showFilters ? ' active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
              title={showFilters ? t('common.hideFilters') : t('common.filters')}
            >
              <span className="filter-toggle-icon" style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              {t('common.filters')}
            </button>
            <Button
              id="employee-export"
              fillMode="outline"
              themeColor="base"
              title={t('common.exportExcel')}
              onClick={() => exportToExcel(data, 'employees')}
              style={{ minWidth: 36, height: 36, padding: '0 10px' }}
            >
              📥
            </Button>
            <Button
              id="employee-add"
              themeColor="primary"
              fillMode="solid"
              onClick={() => navigate('/employees/new')}
            >
              + {t('employees.addButton')}
            </Button>
          </div>
        </div>

        {/* Accordion filter panel */}
        <div className={`filter-accordion${showFilters ? ' open' : ''}`}>
          <div className="filter-accordion-inner">
            <div className="filter-bar-separator" />
            <div className="filter-bar-fields">
              <div className="filter-field">
                <label className="filter-label">{t('employees.filters.firstName')}</label>
                <Input
                  value={filterFirstName}
                  onChange={e => setFilterFirstName(String(e.value ?? ''))}
                  placeholder={t('employees.filters.firstName')}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="filter-field">
                <label className="filter-label">{t('employees.filters.lastName')}</label>
                <Input
                  value={filterLastName}
                  onChange={e => setFilterLastName(String(e.value ?? ''))}
                  placeholder={t('employees.filters.lastName')}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="filter-field">
                <label className="filter-label">{t('employees.filters.status')}</label>
                <DropDownList
                  data={STATUS_OPTIONS}
                  textField="text"
                  dataItemKey="value"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="filter-bar-actions">
                <Button themeColor="primary" fillMode="solid" onClick={handleSearch}>
                  🔍 {t('employees.filters.search')}
                </Button>
                <Button themeColor="base" fillMode="outline" onClick={handleClear}>
                  ✖ {t('employees.filters.clear')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Data Grid ───────────────────────────── */}
      <div className="section-card" style={{ position: 'relative' }}>
        <div className="section-card-body no-pad" style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-base)', opacity: 0.75, zIndex: 10,
              borderRadius: 12,
            }}>
              <Loader size="large" themeColor="primary" />
            </div>
          )}
          <Grid
            data={data}
            total={total}
            skip={page.skip}
            take={page.take}
            pageable={{ pageSizes: [10, 25, 50], info: true, buttonCount: 5 }}
            sortable
            sort={sort}
            filterable={false}
            filter={filter ?? undefined}
            onPageChange={(e: GridPageChangeEvent) => setPage({ skip: e.page.skip, take: e.page.take })}
            onSortChange={(e: GridSortChangeEvent) => setSort(e.sort)}
            scrollable="none"
            style={{ border: 'none', width: '100%' }}
          >
            <GridColumn field="idEmployee" title={t('employees.columns.id')} width="70px" sortable />
            <GridColumn field="firstName"  title={t('employees.columns.firstName')} />
            <GridColumn field="lastName"   title={t('employees.columns.lastName')} />
            <GridColumn
              field="hireDate"
              title={t('employees.columns.hireDate')}
              width="150px"
              cells={{ data: DateCell }}
            />
            <GridColumn
              field="status"
              title={t('employees.columns.status')}
              width="130px"
              cells={{ data: (props) => <StatusCell dataItem={props.dataItem} t={t} /> }}
            />
            <GridColumn
              title={t('employees.columns.actions')}
              width="100px"
              sortable={false}
              cells={{
                data: (props) => (
                  <ActionsCell
                    dataItem={props.dataItem}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ),
              }}
            />
          </Grid>
        </div>
      </div>
      
      {itemToDelete && (
        <DeactivateDialog
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
          title={t('employees.actions.confirmDeleteTitle', 'Delete Employee')}
          message={t('employees.actions.confirmDeleteMessage', `Are you sure you want to delete ${itemToDelete.firstName}?`)}
        />
      )}
    </div>
  );
};

export default EmployeesContainer;
