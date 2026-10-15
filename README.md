# 🏎️ ¡Ka-Chow! Garaje de Radiator Springs & Copa Pistón (Gestor 67)

Aplicación Web CRUD inspirada en la película **Cars (Pixar)**, el legendario circuito de la **Copa Pistón** y los clásicos de la **Ruta 66 en Radiator Springs**. Desarrollada con **NestJS**, **TypeScript**, **Tailwind CSS** y JavaScript interactivo con Web Audio API.

---

## 🚀 Cómo Iniciar el Garaje en Local

1. Abre tu terminal y accede al proyecto:
   ```bash
   cd gestor-67
   ```

2. Inicia el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

3. Abre tu navegador web en:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏁 Características y Diseño de Cars

- **Estilo Visual & Paleta de Carreras**:
  - **Rojo Carreras / Rust-eze (#E60012)** y destellos de atardecer en el desierto.
  - **Amarillo Carretera / Ruta 66 (#FFCC00)** y **Negro Asfalto (#1A1A1A)**.
  - Franja superior con la clásica **bandera a cuadros de NASCAR** 🏁.
  - Tipografías de velocidad: **Russo One** y **Montserrat**.
- **Sección Hero / Acelerador Total**:
  - Banner principal con *"¡Ka-Chow! Bienvenido al acelerador total"*.
  - Botón **"Arrancar Motores"** con **sintetizador de sonido de motor V8** (vía Web Audio API en el navegador), tacómetro animado que sube hasta las 8,500 RPM y ráfaga de chispas/partículas.
- **Fichas Técnicas de Bólidos (CRUD)**:
  - Fichas individuales con barras de velocidad punta (`km/h`), frases célebres y notas de telemetría:
    - **Rayo McQueen #95** (Copa Pistón - 322 km/h - Motor V8 de 750 HP).
    - **Mate (Tow Mater)** (Radiator Springs - Rey del derrape marcha atrás).
    - **Doc Hudson #51** (Leyendas - Fabuloso Hudson Hornet tricampeón).
    - **Sally Carrera** (Radiator Springs - Porsche 911 Carrera).
    - **El Rey #43** (Dinoco - Strip Weathers).
    - **Chick Hicks #86** (Copa Pistón).
  - Selector de vista: **Vista Cuadrícula de Tarjetas** vs **Vista Tabla de Pistas**.
- **Carrusel Interactivo de Circuitos & Postales de la Ruta 66**:
  - Carrusel dinámico responsive con auto-play, controles de reproducción/pausa, flechas de navegación, soporte táctil (swipe), navegación por teclado y dots indicadores.
  - Incluye 6 escenarios legendarios con telemetría y citas célebres: *Radiator Springs*, *Super Speedway (Dinoco 400)*, *Willy's Butte (Curva de Doc)*, *L.A. International Speedway*, *Circuito Urbano de Tokio (WGP)* y *Thomasville Speedway (Smokey)*.
- **Footer Retro Ruta 66**:
  - Emblema vintage de la Ruta 66 y créditos.

---

## 🛠️ Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Interfaz web del Garaje |
| `GET` | `/api/productos` | Obtener bólidos (filtros por `?search=` y `?categoria=`) |
| `GET` | `/api/productos/:id` | Consultar bólido por ID |
| `POST` | `/api/productos` | Registrar nuevo bólido en la parrilla |
| `PUT` | `/api/productos/:id` | Modificar/afinar un bólido existente |
| `DELETE` | `/api/productos/:id` | Retirar bólido (bandera negra) |
| `GET` | `/api/database/status` | Estado de la telemetría con Oracle DB |
| `POST` | `/api/database/reconnect` | Reintentar conexión con Oracle |
