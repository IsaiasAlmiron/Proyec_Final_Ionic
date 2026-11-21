//Importaciones nativas
import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
// Importaciones locales
import { environment } from '../../environments/environment';
import { Moneda, RespuestaTasas } from '../models/moneda';
//Importaciones nativas/exteriores
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError, timeout } from 'rxjs'; 
 

@Injectable({
    providedIn: 'root',
})
export class ServicioCotizaciones {

}
    