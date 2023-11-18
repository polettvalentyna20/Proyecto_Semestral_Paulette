import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  async IsLoggedIn(): Promise<boolean> {
    try {
      const usuarioJSON = await Preferences.get({ key: 'usuario' });
      return !!usuarioJSON.value; 
    } catch (error) {
      console.error('Error al verificar la autenticación:', error);
      return false;
    }
  }

  async getLoggedInUser(): Promise<any> {
    try {
      const usuarioJSON = await Preferences.get({ key: 'usuario' });
      return usuarioJSON.value ? JSON.parse(usuarioJSON.value) : null;
    } catch (error) {
      console.error('Error al obtener el usuario autenticado:', error);
      return null;
    }
  }
}
