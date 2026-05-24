// src/services/auth.service.ts

import { type User } from '../store/authStore';
import api from '../config/axios';

export const AuthService = {
  async login(email: string, password: string): Promise<User> {


    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    // Ejemplo: Si Swagger dice /login, y tu backend corre en el puerto 8000:
    const { data } = await api.post('http://127.0.0.1:8000/api/usuarios/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return data;

  }
};