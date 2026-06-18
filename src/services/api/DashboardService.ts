import apiClient from '../RequestInterceptor';

export interface KpiMetricsResponse {
  totalEmployees: number;
  systemUsers: number;
  totalRoles: number;
  absencesThisMonth: number;
}

export interface AbsenceChartResponse {
  data: number[];
  labels: string[];
}

export interface EmployeeStatusChartResponse {
  status: string;
  count: number;
}

export interface AbsencePivotReportResponse {
  columns: string[];
  data: AbsencePivotRow[];
  totals: Record<string, number>;
}

export interface AbsencePivotRow {
  employeeId: number;
  firstName: string;
  lastName: string;
  hireDate: string;
  absences: Record<string, number>;
}

export class DashboardService {
  static async getKpis() {
    return apiClient.get<{ data: KpiMetricsResponse }>('/DashboardKpi');
  }

  static async getAbsenceChart() {
    return apiClient.get<{ data: AbsenceChartResponse }>('/DashboardChart/Absences');
  }

  static async getEmployeeStatusChart() {
    return apiClient.get<{ data: EmployeeStatusChartResponse[] }>('/DashboardChart/Employees');
  }

  static async getAbsencePivotReport() {
    return apiClient.get<{ data: AbsencePivotReportResponse }>('/DashboardPivotReport');
  }
}
