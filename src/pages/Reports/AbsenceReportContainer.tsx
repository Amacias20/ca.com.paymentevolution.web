import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Loader } from '@progress/kendo-react-indicators';
import { DashboardService } from '../../services/api/DashboardService';
import type { AbsencePivotReportResponse } from '../../services/api/DashboardService';
import { toastError } from '../../utils/toastUtils';
import moment from 'moment';
import { Button } from '@progress/kendo-react-buttons';

const exportToExcel = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).filter(k => k !== 'isTotal');
  const rows = data.map(r => headers.map(h => r[h] ?? ''));
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

const AbsenceReportContainer = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AbsencePivotReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await DashboardService.getAbsencePivotReport();
        setData(response.data?.data || null);
      } catch (error) {
        toastError(t('dashboard.pivotError', 'Error loading absence pivot report'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const columns = data?.columns || [];
  
  // Transform data for the grid
  const gridData = (data?.data || []).map((row) => {
    const flatRow: any = {
      ...row,
      fullName: `${row.firstName} ${row.lastName}`,
    };
    
    let rowTotal = 0;
    columns.forEach(col => {
      const val = row.absences?.[col] || 0;
      flatRow[col] = val;
      rowTotal += val;
    });
    
    flatRow.rowTotal = rowTotal;
    return flatRow;
  });

  if (gridData.length > 0 && data) {
    const grandTotal = columns.reduce((sum, col) => sum + (data.totals[col] || 0), 0);
    
    gridData.push({
      fullName: t('common.total', 'Total'),
      hireDate: null,
      isTotal: true,
      rowTotal: grandTotal,
      ...data.totals
    });
  }

  const DateCell = (props: any) => {
    if (props.dataItem.isTotal) return <td style={{ background: 'var(--bg-surface)' }}></td>;
    const date = props.dataItem[props.field];
    return <td>{date ? moment(date).format('MMM D, YYYY') : '—'}</td>;
  };

  const TotalTextCell = (props: any) => {
    if (props.dataItem.isTotal) {
      return (
        <td style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right', background: 'var(--bg-surface)' }}>
          {props.dataItem[props.field]}
        </td>
      );
    }
    return <td>{props.dataItem[props.field]}</td>;
  };

  const ValueCell = (props: any) => {
    if (props.dataItem.isTotal) {
      return (
        <td style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'center', background: 'var(--bg-surface)' }}>
          {props.dataItem[props.field] || 0}
        </td>
      );
    }
    return <td className="text-center">{props.dataItem[props.field]}</td>;
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-card">
        <div className="page-header-card-top">
          <div>
            <div className="page-title">
              <div className="page-title-icon">📊</div>
              {t('reports.absencesTitle', 'Absences Report')}
            </div>
            <p className="page-subtitle">{t('reports.absencesSubtitle', 'Pivot report showing total absence days per type for each employee.')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              fillMode="outline"
              themeColor="base"
              title={t('common.exportExcel', 'Export to Excel')}
              onClick={() => exportToExcel(gridData, 'absences_report')}
              style={{ height: 36, padding: '0 15px' }}
            >
              📥 {t('common.exportExcel', 'Export to Excel')}
            </Button>
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
          
          {!loading && gridData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>{t('common.noData', 'No data available')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Grid data={gridData} style={{ border: 'none', minHeight: '300px' }}>
                <GridColumn field="fullName" title={t('employees.columns.name', 'Employee')} width="200px" cells={{ data: TotalTextCell }} />
                <GridColumn field="hireDate" title={t('employees.columns.hireDate', 'Hire Date')} width="120px" cells={{ data: DateCell }} />
                
                {columns.map(col => (
                  <GridColumn 
                    key={col} 
                    field={col} 
                    title={col} 
                    width="100px" 
                    headerClassName="text-center"
                    cells={{ data: ValueCell }}
                  />
                ))}

                <GridColumn 
                  field="rowTotal" 
                  title={t('common.total', 'Total')} 
                  width="100px" 
                  headerClassName="text-center"
                  cells={{ data: ValueCell }}
                />
              </Grid>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsenceReportContainer;
