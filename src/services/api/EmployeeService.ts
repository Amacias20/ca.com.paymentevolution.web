import apiClient from '../RequestInterceptor';

export class EmployeeService {
  static async getEmployees(pageNumber = 1, pageSize = 25, orderBy = '') {
    return apiClient.get('/Employee', { params: { pageNumber, pageSize, orderBy } });
  }

  static async getEmployeeById(id: number) {
    return apiClient.get(`/Employee/${id}`);
  }

  static async createEmployee(data: any) {
    return apiClient.post('/Employee', data);
  }

  static async updateEmployee(id: number, data: any) {
    return apiClient.put(`/Employee/${id}`, data);
  }

  static async deleteEmployee(id: number) {
    return apiClient.delete(`/Employee/${id}`);
  }
}
