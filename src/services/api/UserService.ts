import apiClient from '../RequestInterceptor';

export class UserService {
  static async getUsers(pageNumber = 1, pageSize = 25, orderBy = '') {
    return apiClient.get('/User', { params: { pageNumber, pageSize, orderBy } });
  }

  static async getUserById(id: number) {
    return apiClient.get(`/User/${id}`);
  }

  static async createUser(data: any) {
    return apiClient.post('/User', data);
  }

  static async updateUser(id: number, data: any) {
    return apiClient.put(`/User/${id}`, data);
  }

  static async deleteUser(id: number) {
    return apiClient.delete(`/User/${id}`);
  }
}
