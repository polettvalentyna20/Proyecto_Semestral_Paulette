import { Component, AfterViewInit, ViewChild,ElementRef, VERSION } from '@angular/core';
import { Router } from '@angular/router';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Result, BarcodeFormat } from '@zxing/library';
import { ActivatedRoute } from '@angular/router';
import { Animation } from '@ionic/angular';
import { AnimationController } from '@ionic/angular';


import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit {
  nombreUsuario: string = '';
  rut: string = '';
  nombre: string = '';
  apellido: string = '';
  mensajeConSaltoDeLinea: string = '';

  ngVersion = VERSION.full;
  private scanned = false;/* escanner para una  vez*/

  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;
  @ViewChild('title', { read: ElementRef }) title!: ElementRef;
  private animation!: Animation;

  hasDevices = false;
  hasPermission = false;
  qrResultString = '';
  qrResult: Result | null = null;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | null = null;

  formats: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animationCtrl: AnimationController

  ) {}

  async ngOnInit() {
    // Obtén el usuario almacenado en las preferencias
    const usuariosJSON = await Preferences.get({ key: 'usuarios' });
    const usuarios = usuariosJSON && usuariosJSON.value ? JSON.parse(usuariosJSON.value) : [];

    if (usuarios.length > 0) {
      const primerUsuario = usuarios[0]; // muestra el primer usuario
      this.nombreUsuario = primerUsuario.usuario;
      this.rut = primerUsuario.rut || '';
      this.nombre = primerUsuario.nombre || '';
      this.apellido = primerUsuario.apellido || '';
    }
  }

  ngAfterViewInit(): void {
    this.animation = this.animationCtrl
      .create()
      .addElement(this.title.nativeElement)
      .duration(2500)
      .iterations(Infinity)
      .keyframes([
        { offset: 0, transform: 'translateX(0)', opacity: '1' },
        { offset: 0.5, transform: 'translateX(100%)', opacity: '0.2' },
        { offset: 1, transform: 'translateX(0)', opacity: '1' },
      ]);
    this.animation.play();


      
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasDevices = true;
      this.availableDevices = devices;

      // Selects the device's back camera by default
      for (const device of devices) {
        if (/back|rear|environment/gi.test(device.label)) {
          this.currentDevice = device;
          break;
        }
      }
    });

    this.scanner.camerasNotFound.subscribe(() => (this.hasDevices = false));
    this.scanner.scanComplete.subscribe((result: Result) => {
      this.qrResult = result;
      this.handleQrCodeResult(result?.getText());
      
    });
    this.scanner.permissionResponse.subscribe(
      (perm: boolean) => (this.hasPermission = perm)
    );
  }

  handleQrCodeResult(resultString: string | null) {
    if (!this.scanned && resultString) {
      this.scanned = true; // Establece en true para evitar escanear nuevamente

      const now = new Date();
      const horaActual = now.toLocaleTimeString();
      const fechaActual = now.toLocaleDateString();
  
      const mensajeOriginal = `${JSON.stringify(resultString)}, Fecha: ${fechaActual}`;
      //console.log(resultString);
  
      const mensajeSinComilla = mensajeOriginal.replace(/"/g, ' ');
  
      // Utiliza Preferences 
      Preferences.set({ key: 'mensaje', value: mensajeSinComilla });
      console.log(mensajeOriginal);
      
      Preferences.set({ key: 'hora', value: horaActual });
  
      this.router.navigate(['/registro-clase']);
    }
  }
  
 
}
