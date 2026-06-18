import apiClient from '../RequestInterceptor';

export class AuthService {
  static async login(data: any) {
    return apiClient.post('/Auth/Login', data);
  }
}
