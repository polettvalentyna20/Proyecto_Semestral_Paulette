import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const STORAGE_USUARIO = 'usuarioData';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public userCorreo = '';

  constructor() { }

  async getItem(key: string): Promise<string | null> {
    const obj = await Preferences.get({ key });
    return obj.value;
  }

  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  }

  async obtenerUsuario(): Promise<any[]> {
    const storageData = await this.getItem(STORAGE_USUARIO);

    if (!storageData) {
      return [];
    }

    const data: any[] = JSON.parse(storageData) || [];
    return data;
  }

  async agregarUsuario(newUser: any[]) {
    const usuarios = await this.obtenerUsuario();

    newUser.push(...usuarios);

    this.setItem(STORAGE_USUARIO, JSON.stringify(newUser));
  }
}
