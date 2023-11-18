import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Comuna } from 'src/app/models/comuna';
import { Region } from 'src/app/models/region';
import { LocationService } from 'src/app/services/location.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  formularioRegistro: FormGroup;
  regiones: Region[] = [];
  comunas: Comuna[] = [];
  regionSeleccionado: number = 0;
  comunaSeleccionada: number = 0;

  constructor(
    private locationService: LocationService,
    private router: Router,
    public fb: FormBuilder,
    public alertController: AlertController
  ) {
    this.formularioRegistro = this.fb.group({
      'nombre': new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(3), Validators.maxLength(20)]),
      'apellido': new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(3), Validators.maxLength(20)]),
      'rut': new FormControl('', [Validators.required, Validators.pattern(/^\d{7,8}[0-9k]$/)]),
      'usuario': new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-10]*$/), Validators.minLength(6), Validators.maxLength(10)]),
      'password': new FormControl('', [Validators.required, Validators.pattern(/^\d{4}$/), Validators.minLength(4), Validators.maxLength(4)]),
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.cargarRegion();
    this.cargarComuna();
  }

  async cargarRegion() {
    const req = await this.locationService.getRegion();
    this.regiones = req.data;
    console.log('REGION', this.regiones);
  }

  async cargarComuna() {
    const req = await this.locationService.getComuna(this.regionSeleccionado);
    this.comunas = req.data;
    console.log('COMUNA', this.comunas);
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async guardar() {
    const f = this.formularioRegistro.value;

    const usuariosJSON = await Preferences.get({ key:'usuarios'});
    const usuarios = usuariosJSON && usuariosJSON.value ? JSON.parse(usuariosJSON.value) : [];

    if (!this.regionSeleccionado) {
      await this.mostrarAlerta('Región requerida', 'Debes seleccionar una región.');
      return;
    }
  
    if (!this.comunaSeleccionada) {
      await this.mostrarAlerta('Comuna requerida', 'Debes seleccionar una comuna.');
      return;
    }

    if (this.usuarioExiste(usuarios, f.usuario)) {
      await this.mostrarAlerta('Usuario existente', 'El usuario ya existe. Por favor, elige otro nombre de usuario.');
      return;
    }

    if (!f.nombre) {
      await this.mostrarAlerta('Nombre requerido', 'Debes ingresar un nombre de usuario.');
      return;
    }

    if (/^[0-9]*$/.test(f.nombre)) {
      await this.mostrarAlerta('Nombre incorrecto', 'El nombre no debe contener números.');
      return;
    }

    if (f.nombre.length < 3 || f.nombre.length > 20) {
      await this.mostrarAlerta('Nombre incorrecto', 'El nombre debe tener entre 3 y 20 caracteres.');
      return;
    }

    if (!f.apellido) {
      await this.mostrarAlerta('Apellido requerido', 'Debes ingresar un apellido.');
      return;
    }

    if (/^[0-9]*$/.test(f.apellido)) {
      await this.mostrarAlerta('Apellido incorrecto', 'El apellido no debe contener números.');
      return;
    }

    if (f.apellido.length < 3 || f.apellido.length > 20) {
      await this.mostrarAlerta('Apellido incorrecto', 'El apellido debe tener entre 3 y 20 caracteres.');
      return;
    }

    if (!f.rut) {
      await this.mostrarAlerta('RUT requerido', 'Debes ingresar un RUT.');
      return;
    }

    if (!/(\d{7,8}[0-9k]$)/.test(f.rut)) {
      await this.mostrarAlerta('RUT incorrecto', 'El RUT debe tener el formato 12345678-9 o 12345678-k.');
      return;
    }

    if (!f.usuario) {
      await this.mostrarAlerta('Usuario requerido', 'Debes ingresar un nombre de usuario.');
      return;
    }

    if (f.usuario.length < 6 || f.usuario.length > 10) {
      await this.mostrarAlerta('Usuario incorrecto', 'El usuario debe tener entre 3 y 8 caracteres.');
      return;
    }

    if (!f.password) {
      await this.mostrarAlerta('Contraseña requerida', 'Debes ingresar una contraseña.');
      return;
    }

    if (!/^\d{4}$/.test(f.password)) {
      await this.mostrarAlerta('Contraseña incorrecta', 'La contraseña debe tener exactamente 4 números.');
      return;
    }

    var usuarioRe = {
      rut: f.rut,
      nombre: f.nombre,
      apellido: f.apellido,
      usuario: f.usuario,
      password: f.password,
      region: this.regiones.find(region => region.id === this.regionSeleccionado),
      comuna: this.comunas.find(comuna => comuna.id === this.comunaSeleccionada)
    }

    usuarios.push(usuarioRe);
    await Preferences.set({ key:'usuarios', value: JSON.stringify(usuarios) } );

    console.log('Usuario registrado exitosamente.');
    const successAlert = await this.alertController.create({
      header: 'Usuario Registrado',
      message: 'Usuario registrado exitosamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await successAlert.present();
  }

  passwordMatchValidator(formGroup: FormGroup) {
  }

  usuarioExiste(usuarios: any[], usuario: string): boolean {
    return usuarios.some(u => u.usuario === usuario);
  }
}
