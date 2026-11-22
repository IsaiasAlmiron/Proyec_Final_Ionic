// Importaciones de Angular
import { Injectable } from '@angular/core';
// Importaciones locales
import { environment } from '../../environments/environment';
import { Moneda, RespuestaTasas } from '../models/moneda';
// Importaciones externas
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
 

@Injectable({
    providedIn: 'root',
})
export class ServicioCotizaciones {
    // Mostrar primero las monedas más usadas; el resto va alfabeticamente.
    private readonly prioridad = ['USD', 'EUR', 'BRL', 'ARS', 'PYG', 'GBP', 'JPY', 'CLP']; // Solo se usa dentro de este servicio y no se puede reasignar 

    constructor(private clienteHttp: HttpClient) {}

    obtenerTasas(): Observable<RespuestaTasas> {
        return this.clienteHttp.get<RespuestaTasas>(`${environment.apiUrl}/latest/USD`).pipe(
            // Si la API no responde en 10 segundos, se genera un error
            timeout(10000),

            // Verificar que la API haya respondido bien
            map((respuesta) => {
                if (respuesta.result !== 'success') {
                    throw new Error('La API respondio con un error');
                }
                return respuesta;
            }),

            // Convertir cualquier error tecnico en un mensaje entendible
            catchError(() =>
                throwError(
                    () => new Error('No se pudieron cargar las cotizaciones. Revise su conexion o contactese con el soporte tecnico del sistema'),
                ),
            ),
        );
    }

    // Recibe la respuesta de la API y devuelve un arreglo de monedas listo para mostrar
    lista(respuesta: RespuestaTasas): Moneda[] {
        // Guarda cuantos guaranies vale 1 dolar,sirve de base para calcular las demas monedas
        const equivalenciaGuaraniDolar = respuesta.rates['PYG'];

        // Convertir el objeto en un arreglo de pares [codigo, valor]
        // Ejemplo: { USD: 1, EUR: 0.905 } pasa a [['USD', 1], ['EUR', 0.905]]
        return Object.entries(respuesta.rates)
        .map(([codigo, equivalenciaDolar]) => ({
            codigo, // Codigo de la moneda (USD, EUR...).
            nombre: this.nombreDe(codigo), // Nombre completo a partir del codigo
            equivalenciaDolar, // Unidades de esta moneda por 1 USD (dato de la API)
            // La API da unidades por 1 USD
            // 1 USD = 6265 PYG y 1 USD = 0.905 EUR
            // Entonces 1 EUR = 6265 / 0.905 PYG
            // Cuántos guaranies vale 1 unidad de esta moneda
            equivalenciaGuarani: equivalenciaGuaraniDolar / equivalenciaDolar,
        }))
        .sort((a, b) => { // Ordena primero las de prioridad y despues el resto alfabeticamente
            // Posicion de a en prioridad; -1 si no esta
            const indiceA = this.prioridad.indexOf(a.codigo);
            // Posicion de b en prioridad; -1 si no esta
            const indiceB = this.prioridad.indexOf(b.codigo);

            // Si al menos una de las dos esta en la lista de prioridad
            if (indiceA !== -1 || indiceB !== -1) {
                if (indiceA === -1) return 1; // a no es prioritaria: va despues de b
                if (indiceB === -1) return -1; // b no es prioritaria: a va antes
                return indiceA - indiceB; // Las dos son prioritarias: menor indice primero
            }

            return a.codigo.localeCompare(b.codigo); // Ninguna es prioritaria: orden alfabetico
        });
    }

    private nombreDe(codigo: string): string {
    try {
      const nombres = new Intl.DisplayNames(['es'], { type: 'currency' });
      const nombre = nombres.of(codigo) ?? codigo; // .of(codigo) recibe un codigo de moneda y devuelve su nombre en el idioma configurado
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
      // charAt(0) saca la primera letra, toUpperCase() la pone en mayuscula
      // y slice(1) trae y junta el resto del nombre.
    } catch {
      
      return codigo; // Si Intl.DisplayNames falla o no esta disponible, mostramos el codigo
    }
  }
}