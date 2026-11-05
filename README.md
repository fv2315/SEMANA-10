# Semana 10 — API de productos

API REST de productos con Node.js, Express y MySQL, acompañada por una interfaz web para administrar el inventario.

## Requisitos

- Node.js 20 o superior
- MySQL (por ejemplo, XAMPP o Laragon)

## Instalación y ejecución

1. Instala las dependencias con `npm install`.
2. Ejecuta el script [`sql/schema.sql`](./sql/schema.sql) en MySQL para crear `db_lab10` y la tabla `productos`.
3. Copia `.env.example` como `.env` y completa la configuración local de MySQL. No subas `.env` al repositorio.
4. Inicia el servidor con `npm run dev` o `npm start`.
5. Abre <http://localhost:3000>.

La interfaz y la API se sirven desde el mismo servidor. Si MySQL no está disponible, el servidor igualmente inicia para poder consultar la interfaz; las operaciones de productos mostrarán el error de conexión.

## Endpoints

Todas las respuestas de la API están en JSON. Los productos usan `nombre`, `precio` y `stock`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/productos` | Lista los productos (`200`) |
| POST | `/api/productos` | Crea un producto (`201`) |
| PUT | `/api/productos/:id` | Actualiza sus datos (`200`) |
| DELETE | `/api/productos/:id` | Elimina el producto (`200`) |
| GET | `/api/health` | Comprueba que la API está activa (`200`) |

Ejemplo de body para crear o actualizar:

```json
{
  "nombre": "Teclado mecánico",
  "precio": 149.9,
  "stock": 12
}
```

Los errores de validación devuelven `400`, los productos inexistentes `404` y los errores internos `500`, siempre con `{ "error": "mensaje" }`.

## Pruebas HTTP

Abre [`requests/productos.http`](./requests/productos.http) en VS Code con la extensión REST Client para probar los cuatro métodos y respuestas de error. También puedes importar los mismos endpoints en Postman o Thunder Client.

## Evidencias

Toma capturas reales de la estructura y el código, y de las solicitudes/respuestas en Postman, Insomnia o REST Client. No se incluyen capturas simuladas.
