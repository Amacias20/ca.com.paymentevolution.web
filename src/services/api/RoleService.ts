import apiClient from '../RequestInterceptor';

export class RoleService {
  static async getRoles(pageNumber = 1, pageSize = 25, orderBy = '') {
    return apiClient.get('/Role', { params: { pageNumber, pageSize, orderBy } });
  }

  static async getRoleById(id: number) {
    return apiClient.get(`/Role/${id}`);
  }

  static async createRole(data: any) {
    return apiClient.post('/Role', data);
  }

  static async updateRole(id: number, data: any) {
    return apiClient.put(`/Role/${id}`, data);
  }

  static async deleteRole(id: number) {
    return apiClient.delete(`/Role/${id}`);
  }
}
