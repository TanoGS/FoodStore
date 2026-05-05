// src/services/auth.service.ts

import { type User } from '../store/authStore';
import api from '../config/axios';

export const AuthService = {
  async login(email: string, password: string): Promise<{ access_token: string, user: User }> {

    // ---------------------------------------------------------
    // 🛑 MOCK DE PRUEBA (Borrar cuando el backend esté listo)
    // ---------------------------------------------------------
    /*
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Credenciales de prueba
        if (email === 'admin@admin.com' && password === 'admin') {
          resolve({
            access_token: 'mock-jwt-token-12345',
            user: {
              id: 1,
              email: 'admin@admin.com',
              nombre: 'Super Gestor',
              rol: 'admin' // <-- Esto hará que el Login nos envíe a /admin
            }
          });
        } else {
          // Simulamos un error 401 (No Autorizado)
          reject({
            response: { status: 401 }
          });
        }
      }, 1000); // Simulamos 1 segundo de carga de red
    });
*/
    // ---------------------------------------------------------
    // ✅ CÓDIGO REAL (Descomentar en la Fase 3)
    // ---------------------------------------------------------

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