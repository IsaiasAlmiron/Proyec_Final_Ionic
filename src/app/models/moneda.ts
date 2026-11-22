export interface RespuestaTasas {
    // Campos de la respuesta de la API open.er-api.com.
  result: string;
  provider: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>; // "rates": { "USD": 1, "EUR": 0.905, "PYG": 6265 }
}

export interface Moneda {
  codigo: string;              // USD, EUR, PYG...
  nombre: string;              // Dólar estadounidense, Euro...
  equivalenciaDolar: number;   // cuántas unidades de esta moneda equivalen a 1 USD
  equivalenciaGuarani: number; // cuántos guaraníes vale 1 unidad de esta moneda
}