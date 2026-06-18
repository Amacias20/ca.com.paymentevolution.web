import { useEffect, useState } from 'react';
import { Chart, ChartSeries, ChartSeriesItem, ChartCategoryAxis, ChartCategoryAxisItem, ChartTitle, ChartLegend, ChartTooltip, ChartValueAxis, ChartValueAxisItem } from '@progress/kendo-react-charts';
import { DashboardService } from '../../services/api/DashboardService';
import { Loader } from '@progress/kendo-react-indicators';

interface KpiData {
  employees: number;
  users: number;
  roles: number;
  absences: number;
  loading: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const KPI_CARDS = [
  {
    key: 'employees',
    label: 'Total Employees',
    icon: '👥',
    color: '#5b5ef4',
    bg: 'rgba(91,94,244,0.12)',
    border: 'rgba(91,94,244,0.2)',
    trend: '+3 this month',
    trendDir: 'up' as const,
  },
  {
    key: 'users',
    label: 'System Users',
    icon: '🔐',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.2)',
    trend: '+1 this week',
    trendDir: 'up' as const,
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: '🛡️',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.2)',
    trend: 'Stable',
    trendDir: undefined,
  },
  {
    key: 'absences',
    label: 'Absences (Month)',
    icon: '📅',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    trend: '-2 vs last month',
    trendDir: 'up' as const,
  },
];

const chartTooltipRender = ({ point }: any) =>
  `${point.category}: ${point.value} absences`;

const DashboardContainer = () => {
  const [kpi, setKpi] = useState<KpiData>({
    employees: 0, users: 0, roles: 0, absences: 0, loading: true,
  });
  const [absenceData, setAbsenceData] = useState<number[]>([]);
  const [statusData, setStatusData] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, absRes, empRes] = await Promise.allSettled([
          DashboardService.getKpis(),
          DashboardService.getAbsenceChart(),
          DashboardService.getEmployeeStatusChart(),
        ]);

        if (kpiRes.status === 'fulfilled') {
          const data = kpiRes.value.data.data;
          setKpi({
            employees: data.totalEmployees,
            users: data.systemUsers,
            roles: data.totalRoles,
            absences: data.absencesThisMonth,
            loading: false,
          });
        }
        
        if (absRes.status === 'fulfilled') {
          setAbsenceData(absRes.value.data.data.data);
        }

        if (empRes.status === 'fulfilled') {
          setStatusData(empRes.value.data.data);
        }
      } catch {
        setKpi(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAll();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <div className="page-title-icon">📊</div>
            Dashboard
          </div>
          <p className="page-subtitle">Overview of your Payment Evolution system</p>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.375rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      {kpi.loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size="large" themeColor="primary" />
        </div>
      ) : (
        <div className="kpi-grid animate-children">
          {KPI_CARDS.map((card) => (
            <div
              key={card.key}
              className="kpi-card animate-fade-in"
              style={{ '--kpi-color': card.color, '--kpi-bg': card.bg, '--kpi-border': card.border } as React.CSSProperties}
            >
              <div className="kpi-card-header">
                <div>
                  <div className="kpi-card-label">{card.label}</div>
                </div>
                <div className="kpi-card-icon">{card.icon}</div>
              </div>
              <div className="kpi-card-value">
                {kpi[card.key as keyof Omit<KpiData, 'loading'>].toLocaleString()}
              </div>
              <div className={`kpi-card-trend${card.trendDir ? ` ${card.trendDir}` : ''}`}>
                {card.trendDir === 'up' ? '↑ ' : ''}{card.trend}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Absences by Month */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">📈 Absences by Month</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Year</span>
          </div>
          <div className="section-card-body" style={{ padding: '1rem' }}>
            <Chart style={{ height: '240px' }}>
              <ChartTitle text="" />
              <ChartLegend visible={false} />
              <ChartTooltip render={chartTooltipRender} />
              <ChartCategoryAxis>
                <ChartCategoryAxisItem
                  categories={MONTHS}
                  labels={{ color: '#64748b', font: '11px Inter, sans-serif' }}
                  majorGridLines={{ visible: false }}
                  axisCrossingValue={0}
                />
              </ChartCategoryAxis>
              <ChartValueAxis>
                <ChartValueAxisItem
                  labels={{ color: '#64748b', font: '11px Inter, sans-serif' }}
                  majorGridLines={{ color: 'rgba(255,255,255,0.05)' }}
                  line={{ visible: false }}
                />
              </ChartValueAxis>
              <ChartSeries>
                <ChartSeriesItem
                  type="column"
                  data={absenceData}
                  color="#5b5ef4"
                  opacity={0.85}
                  border={{ width: 0 }}
                  gap={1.5}
                  spacing={0.2}
                  overlay={{ gradient: 'roundedBevel' }}
                />
              </ChartSeries>
            </Chart>
          </div>
        </div>

        {/* Employees by Department */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">🏢 Employees by Status</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution</span>
          </div>
          <div className="section-card-body" style={{ padding: '1rem' }}>
            <Chart style={{ height: '240px' }}>
              <ChartTitle text="" />
              <ChartLegend position="bottom" labels={{ color: '#94a3b8', font: '11px Inter, sans-serif' }} />
              <ChartTooltip />
              <ChartSeries>
                <ChartSeriesItem
                  type="donut"
                  data={statusData}
                  field="count"
                  categoryField="status"
                  holeSize={70}
                  labels={{ visible: false }}
                  overlay={{ gradient: 'roundedBevel' }}
                />
              </ChartSeries>
            </Chart>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">⚡ Quick Access</div>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'View Employees', icon: '👥', path: '/employees', color: '#5b5ef4' },
              { label: 'Manage Users', icon: '🔐', path: '/users', color: '#06b6d4' },
              { label: 'Configure Roles', icon: '🛡️', path: '/roles', color: '#a78bfa' },
              { label: 'View Absences', icon: '📅', path: '/absences', color: '#f59e0b' },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.875rem 1rem', borderRadius: '10px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = item.color + '66';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
