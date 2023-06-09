import { Component, OnDestroy, ViewChild} from '@angular/core';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { Evento, EventoForm } from '../models/evento';
import { EventoService } from '../services/evento.service';
import {AlertController,IonSearchbar,IonSelect,ModalController,ToastController,} from '@ionic/angular'
import { CommonModule } from '@angular/common';
import { AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators, } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('calendar', { static: false }) calendar!: IonDatetime;

  private eventoColores = {
    'XV años': { backgroundColor: '#428cff', textColor: '#fff' },
    Boda: { backgroundColor: '#2fdf75', textColor: '#000' },
    Cumpleaños: { backgroundColor: '#ffd534', textColor: '#000' },
  };

  reservacionEvento: colorEvt[] = [];
  eventoForm: FormGroup<EventoForm>;
  eventoSeleccionado?: Evento;
   eventos    : Evento[] = [];
   isModalOpen = false;
   disponible  = -1;
   openOp      = 0;
   updateEvt = false;
   fechaSel    = '';
   validationMessages;

  constructor(
    private evtService: EventoService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.eventoForm = new FormGroup({
      fecha: new FormControl(this.fechaSel,{nonNullable: true,validators: [Validators.required]}),
      horaInicio: new FormControl('',{nonNullable: true,validators: [Validators.required, Validators.min(10)]}), 
      horaFin: new FormControl('',{nonNullable: true,validators: [Validators.required,Validators.min(10), Validators.max(23)]}),
      nombreCliente: new FormControl('',{nonNullable: true,validators: [Validators.required]}),
      celularCliente: new FormControl('',{nonNullable: true,validators: [Validators.required,Validators.minLength(10),Validators.maxLength(10),Validators.pattern('[0-9]*')]}), 
      tipoEvento: new FormControl('',{nonNullable: true,validators: [Validators.required]}), 
      nota: new FormControl('',{nonNullable: true}),  
      llenadoAgua: new FormControl(45,{nonNullable: true, validators: [Validators.required, Validators.min(45), Validators.max(500)]}),
      mesaRegalos: new FormControl('si',{nonNullable: true,validators: [Validators.required]}),
      cantPersonas: new FormControl(0,{nonNullable: true,validators: [Validators.required, Validators.max(100), Validators.min(1)]}), 
      brincolin: new FormControl('si',{nonNullable: true,validators: [Validators.required]}),
      mantelColor: new FormControl<string[]>([],{nonNullable: true,validators: [Validators.required]}),
      precioTotal: new FormControl(2200,{nonNullable: true,validators: [Validators.required]}),
      aCuenta: new FormControl(500,{nonNullable: true,validators: [Validators.required]}),
      resto: new FormControl(1700,{nonNullable: true,validators: [Validators.required]}),
      metodoPago: new FormControl<string[]>([],{nonNullable: true,validators: [Validators.required]}), 
      estatus: new FormControl('',{nonNullable: true}),
      activo: new FormControl('si',{nonNullable: true}) 
    });
    
    this.validationMessages = {
      horaInicio: [
        {tipo: 'required', mensaje: 'Hora de inicio requerida'},
        {tipo: 'min', mensaje: 'hora invalida'}
      ],
      horaFin: [
        {tipo: 'required', mensaje: 'Hora de fin requerida'},
        {tipo: 'max', mensaje: 'hora invalida'},
        {tipo: 'min', mensaje: 'hora invalida'}  
    ],
      nombreCliente: [{tipo: 'required', mensaje: 'Nombre requerido'}],
      celularCliente: [
        {tipo: 'required', mensaje: 'Celular requerido'},
        {tipo: 'minlength', mensaje: 'Telefono incorrecto'},
        {tipo: 'maxlength', mensaje: 'Telefono incorrecto'},
        {tipo: 'pattern', mensaje: 'Formato Incorrecto'}
      ],
      tipoEvento: [{tipo: 'required', mensaje: 'Tipo de evento requerido'}],
      nota: [],
      llenadoAgua: [
        {tipo: 'required', mensaje: 'Tipo de evento requerido'},
        {tipo: 'max', mensaje: 'El maximo es 100%'},
        {tipo: 'min', mensaje: '45 Es el minimo'}  
      ],
      mesaRegalos: [{tipo: 'required', mensaje: 'Seleccione una opcion'}],
      cantPersonas: [
        {tipo: 'required', mensaje: 'Cantidad requerida'},
        {tipo: 'max', mensaje: 'El maximo es 100'},
        {tipo: 'min', mensaje: 'Ingrese una cantidad valida'}  
      ],
      brincolin: [{tipo: 'required', mensaje: 'Brincolin requerido'}],
      mantelColor: [{tipo: 'required', mensaje: 'Color(es) requerido(s)'}],
      precioTotal: [],
      aCuenta: [
        {tipo: 'required', mensaje: 'Debe dar anticipo para reservar'}
      ],
      resto: [],
      metodoPago: [{tipo: 'required', mensaje: 'Porfavor seleccione uno'}],
      estatus: [],
      activo: [],
    }
    
  }

  ngOnInit() {
    this.evtService.getEventosListAPI().subscribe( (data) => {
      this.eventos = data.eventosList;
    });
    console.log(this.eventos);
    this.eventos.forEach((dat) => this.marcarFecha(dat.fecha, dat.tipoEvento));
    
  }

  calcularExtras() {
    let total = 2200;
    this.eventoForm.controls['fecha'].setValue(this.fechaSel);
    if (this.eventoForm.controls['brincolin'].value=='si') total = total+ 500;
    const alb = this.eventoForm.controls['llenadoAgua'].value
    if(alb>45) total = total + (1500*(alb/100));
    this.eventoForm.controls['precioTotal'].setValue(total);
    const aCuenta = this.eventoForm.controls['aCuenta'].value;
    const resto = total-aCuenta
    this.eventoForm.controls['resto'].setValue(resto);
    if(resto==0) this.eventoForm.controls['estatus'].setValue('pagado');
    else this.eventoForm.controls['estatus'].setValue('restante');
    const fecha = this.eventoForm.controls['fecha'].value;
    console.log(fecha);
    //this.eventoForm.controls['total'].setValue(true);
  }

  agregarEvento() {
    this.calcularExtras();
    this.calendar.reset();
    const evento: Evento = this.eventoForm.getRawValue();
    //this.evtService.addEvento(evento);
    //this.eventos.push(evento);
    this.evtService.postEventoItemAPI(evento).subscribe( (data) => {
      console.log(data);
    });
    console.log(evento);
    this.eventos.forEach((evento) => this.marcarFecha(evento.fecha, evento.tipoEvento));
    this.limpiarFormularioForce();
  }

  setUpdate(upd: boolean) {
    this.updateEvt = upd;
  }

  modificar() {
    this.eventoForm.controls['resto'].setValue(0);
    this.eventoForm.controls['aCuenta'].setValue(0);
    const eventoUpd = this.eventoForm.getRawValue();
    /*const index = this.evtService.findEventoIndex(eventoUpd.fecha);
    this.evtService.updateEvento(eventoUpd,index);
    this.eventos[index]=eventoUpd;*/
    this.evtService.updateEventoItemAPI(eventoUpd,eventoUpd.fecha).subscribe( (data) => {
      console.log(data);
    });
  }

  private marcarFecha(fecha: string, tipo: string) {
    const color =
      tipo === 'XV años'
        ? this.eventoColores['XV años']
        : tipo === 'Boda'
        ? this.eventoColores['Boda']
        : this.eventoColores['Cumpleaños'];
    this.reservacionEvento.push({ date: fecha, ...color });
  }

  setOpen(isOpen: boolean, op: number) {
    if (!isOpen) {
      this.confirmationDialog('¿Estas seguro de cancelar la operación?, perderás los datos capturados.',
      () => {
        this.isModalOpen = isOpen;
    });
    }
    else if (isOpen) this.isModalOpen = isOpen;
    this.openOp = op;
    //0 Nada
    //1 Modificar
    //2 Insertar
  }

  onDateChange(event: any) {
    console.log('entre');
    const date = event.detail.value[0];
    const dia = parseInt(date.substring(8,10));
    console.log(date);
    this.fechaSel = date;
    const evt = this.eventos
    let foundItem;
    this.evtService.getEventosItemAPI(date).subscribe( data => {
      foundItem = data.eventoItem;
    });
    console.log(foundItem);
    if (dia>=8) {
      if (foundItem) { 
        this.presentToast('Fecha Ocupada','danger');
        console.log('Busy');
        this.eventoSeleccionado = this.evtService.getEveto(date);
        this.disponible = 0;
        const eventoActual = this.evtService.getEveto(this.fechaSel);
        if (eventoActual) this.eventoForm.patchValue(eventoActual);
        console.log(eventoActual);
      }
      else { 
        this.presentToast('Fecha Disponible','success');
        console.log('Available');
        this.limpiarFormularioForce();
        this.disponible = 1;
      }
    }else {
      console.log('Not valid');
      this.disponible = 2;
    }
    this.calendar.reset();
    
  }
  private async confirmationDialog(
    header: string,
    handler?: Function,
    dismissFunction?: Function
  ) {
    const alert = await this.alertController.create({
      header,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.presentToast('Operación cancelada', 'warning');
          },
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          cssClass: 'primary',
          handler: () => {
            if (handler) handler();
            this.presentToast('Operación realizada', 'success');
          },
        },
      ],
    });
    alert.present();
    alert.onDidDismiss().then((respuesta) => {
      if (dismissFunction) dismissFunction(respuesta);
    });
  }

  limpiarFormularioForce() {
    this.eventoForm = new FormGroup({
      fecha: new FormControl(this.fechaSel,{nonNullable: true,validators: [Validators.required]}),
      horaInicio: new FormControl('',{nonNullable: true,validators: [Validators.required, Validators.min(10)]}), 
      horaFin: new FormControl('',{nonNullable: true,validators: [Validators.required,Validators.min(10), Validators.max(23)]}),
      nombreCliente: new FormControl('',{nonNullable: true,validators: [Validators.required]}),
      celularCliente: new FormControl('',{nonNullable: true,validators: [Validators.required,Validators.minLength(10),Validators.maxLength(10),Validators.pattern('[0-9]*')]}), 
      tipoEvento: new FormControl('',{nonNullable: true,validators: [Validators.required]}), 
      nota: new FormControl('',{nonNullable: true}),  
      llenadoAgua: new FormControl(45,{nonNullable: true, validators: [Validators.required, Validators.min(45), Validators.max(500)]}),
      mesaRegalos: new FormControl('si',{nonNullable: true,validators: [Validators.required]}),
      cantPersonas: new FormControl(0,{nonNullable: true,validators: [Validators.required, Validators.max(100), Validators.min(1)]}), 
      brincolin: new FormControl('si',{nonNullable: true,validators: [Validators.required]}),
      mantelColor: new FormControl<string[]>([],{nonNullable: true,validators: [Validators.required]}),
      precioTotal: new FormControl(2200,{nonNullable: true,validators: [Validators.required]}),
      aCuenta: new FormControl(500,{nonNullable: true,validators: [Validators.required, Validators.min(100)]}),
      resto: new FormControl(1700,{nonNullable: true,validators: [Validators.required]}),
      metodoPago: new FormControl<string[]>([],{nonNullable: true,validators: [Validators.required]}), 
      estatus: new FormControl('',{nonNullable: true}),
      activo: new FormControl('si',{nonNullable: true}) 
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 500,
      color,
    });
    toast.present();
  }
  
}

interface colorEvt {
  date: string;
  backgroundColor: string;
  textColor: string;
}
