import apiClient from '../RequestInterceptor';
import moment from 'moment';

export class AbsenceService {
  static async getAbsences(pageNumber = 1, pageSize = 25, orderBy = '') {
    return apiClient.get('/absence', { params: { pageNumber, pageSize, orderBy } });
  }

  static async getAbsenceById(id: number) {
    return apiClient.get(`/absence/${id}`);
  }

  static async createAbsence(data: any) {
    const payload = { ...data };
    if (payload.startDate) payload.startDate = moment(payload.startDate).format('YYYY-MM-DD');
    if (payload.endDate) payload.endDate = moment(payload.endDate).format('YYYY-MM-DD');
    return apiClient.post('/absence', payload);
  }

  static async updateAbsence(id: number, data: any) {
    const payload = { ...data };
    if (payload.startDate) payload.startDate = moment(payload.startDate).format('YYYY-MM-DD');
    if (payload.endDate) payload.endDate = moment(payload.endDate).format('YYYY-MM-DD');
    return apiClient.put(`/absence/${id}`, payload);
  }

  static async deleteAbsence(id: number) {
    return apiClient.delete(`/absence/${id}`);
  }
}
