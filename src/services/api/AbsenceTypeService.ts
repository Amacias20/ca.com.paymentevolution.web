import apiClient from '../RequestInterceptor';

export class AbsenceTypeService {
  static async getAbsenceTypes(pageNumber = 1, pageSize = 25, orderBy = '') {
    return apiClient.get('/absence-type', { params: { pageNumber, pageSize, orderBy } });
  }

  static async getAbsenceTypeById(id: number) {
    return apiClient.get(`/absence-type/${id}`);
  }

  static async createAbsenceType(data: any) {
    return apiClient.post('/absence-type', data);
  }

  static async updateAbsenceType(id: number, data: any) {
    return apiClient.put(`/absence-type/${id}`, data);
  }

  static async deleteAbsenceType(id: number) {
    return apiClient.delete(`/absence-type/${id}`);
  }
}
