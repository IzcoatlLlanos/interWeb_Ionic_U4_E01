export interface Evento {
    fecha            : string;
    horaInicio       : string;
    horaFin          : string;
    nombreCliente    : string;
    celularCliente   : string;
    tipoEvento       : string;
    nota             : string;
    llenadoAgua      : number;
    mesaRegalos      : string;
    cantPersonas     : number;
    brincolin        : string;
    mantelColor      : string[];
    precioTotal      : number;
    aCuenta          : number;
    resto            : number;
    metodoPago       : string[];
    estatus          : string;   
    activo         : string;
 }
 
 import { FormControl } from '@angular/forms';
 
 export interface EventoForm {
     fecha           : FormControl<string>;
     horaInicio      : FormControl<string>;
     horaFin         : FormControl<string>;
     nombreCliente   : FormControl<string>;
     celularCliente  : FormControl<string>;
     tipoEvento      : FormControl<string>;
     nota            : FormControl<string>;
     llenadoAgua     : FormControl<number>;
     mesaRegalos     : FormControl<string>;
     cantPersonas    : FormControl<number>;
     brincolin       : FormControl<string>;
     mantelColor     : FormControl<string[]>;
     precioTotal     : FormControl<number>;
     aCuenta         : FormControl<number>;
     resto           : FormControl<number>;
     metodoPago      : FormControl<string[]>;
     estatus         : FormControl<string>;
     activo        : FormControl<string>;
   }
   