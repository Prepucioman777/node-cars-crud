# 🏎️ Documentación Integral: Gestor 67 (Garaje de Radiator Springs & Copa Pistón)

> **Contexto Académico / Asignatura:** Seguridad y Contenedores (6to Semestre - INACAP)\
> **Propósito del Documento:** Explicar la arquitectura, tecnologías, estructura de carpetas y la configuración y propósito de los archivos Docker de este proyecto.

------------------------------------------------------------------------

## 📌 1. Visión General del Proyecto

**Gestor 67** es una aplicación web full-stack que implementa un sistema **CRUD** (Crear, Leer, Actualizar, Eliminar) interactivo con temática inspirada en la película **Cars (Pixar)**, la Copa Pistón y la Ruta 66.

El proyecto simula un garaje de bólidos (Rayo McQueen, Mate, Doc Hudson, Sally, El Rey, Chick Hicks) con telemetría en tiempo real, efectos sonoros (motor V8 mediante Web Audio API) y conectividad con base de datos empresarial **Oracle Database**.

### Pilares de Diseño y Seguridad

1.  **Resiliencia ante caídas (Fallback en memoria):** Si la base de datos Oracle está apagada, reiniciándose o no disponible, la aplicación no crashea ni se detiene; cambia automáticamente a un modo en memoria (*in-memory fallback*) y permite forzar la reconexión en caliente vía API cuando la base de datos vuelva a estar activa.
2.  **Seguridad contra inyecciones:**
    - **SQL Injection:** Todas las consultas SQL en Oracle usan variables enlazadas (*bind variables* / consultas preparadas).
    - **Data Tampering:** Se valida y sanitiza cada petición HTTP entrante mediante *ValidationPipes* de NestJS con `whitelist: true`, descartando atributos maliciosos o no definidos.
3.  **Contenerización Segura:** Configuración de Docker siguiendo estándares de la industria (Multi-stage build, imagen base mínima y ejecución con usuario sin privilegios `node`, evitando ejecutar el contenedor como `root`).

------------------------------------------------------------------------

## 🛠️ 2. Tecnologías Utilizadas

### Backend

- **Node.js 20 LTS**: Entorno de ejecución en JavaScript/TypeScript del lado del servidor.
- **NestJS (v12)**: Framework empresarial de Node.js con arquitectura modular orientada a objetos (Módulos, Controladores, Servicios, DTOs).
- **TypeScript**: Superset de JavaScript con tipado estático fuerte para evitar errores en tiempo de compilación.
- **Express**: Servidor HTTP subyacente para gestionar peticiones REST y servir el frontend estático.
- **class-validator & class-transformer**: Librerías de validación declarativa para los objetos de transferencia de datos (DTOs).
- **oracledb (v7)**: Controlador oficial de Oracle para Node.js con soporte de Connection Pooling y ejecución asíncrona.
- **dotenv**: Manejo de variables de entorno desacopladas del código.

### Frontend

- **HTML5 Semántico**: Estructura de la interfaz de usuario.
- **Tailwind CSS**: Framework de diseño utilitario para estilos responsivos con estética de carreras.
- **JavaScript Moderno (ES6+)**: Consumo de la API REST mediante `fetch`, control del DOM y modales de confirmación.
- **Web Audio API**: Sintetizador de audio en tiempo real dentro del navegador (reproduce sonido de motor V8 y acelera un tacómetro animado sin requerir archivos MP3 externos).

### Base de Datos

- **Oracle Database 23ai / Free (`FREEPDB1`)**:
  - Tabla principal: `PRODUCTOS` (ID numérico autoincremental por identidad, nombre, descripción, categoría, precio/velocidad, stock y marca temporal de creación).

### DevOps & Contenedores

- **Docker**: Empaquetado y aislamiento del entorno de ejecución.
- **Docker Compose**: Orquestación declarativa de servicios, redes compartidas y variables de configuración.

------------------------------------------------------------------------

## 📂 3. Estructura de Carpetas y Archivos Importantes

``` plaintext
gestor-67/
├── src/                               # 🧠 Código fuente Backend (NestJS)
│   ├── main.ts                        # Punto de entrada de la aplicación
│   ├── app.module.ts                  # Módulo raíz que ensambla toda la app
│   ├── app.controller.ts              # Controlador raíz básico
│   ├── app.service.ts                 # Servicio raíz básico
│   ├── database/                      # Módulo de Base de Datos Oracle
│   │   ├── database.module.ts         # Registro y exportación del servicio DB
│   │   ├── database.service.ts        # Conexión, inicialización de esquema y fallback
│   │   └── database.controller.ts     # Endpoints /api/database (status y reconnect)
│   └── productos/                     # Módulo CRUD de Bólidos
│       ├── dto/                       # Reglas de validación de peticiones
│       │   ├── create-producto.dto.ts # Valida los datos requeridos al crear un bólido
│       │   └── update-producto.dto.ts # Valida los campos opcionales al editar
│       ├── entities/
│       │   └── producto.entity.ts     # Modelo TypeScript de un Producto
│       ├── productos.controller.ts    # Endpoints REST (/api/productos)
│       ├── productos.module.ts        # Registro del módulo de productos
│       └── productos.service.ts       # Lógica CRUD (Oracle SQL + Memoria)
├── public/                            # 🎨 Frontend web servido por NestJS
│   ├── index.html                     # Interfaz visual del Garaje
│   ├── css/styles.css                 # Estilos específicos (bandera de cuadros, etc.)
│   └── js/app.js                      # Lógica del cliente, modales, API fetch y audio
├── dist/                              # ⚙️ Código JavaScript compilado (generado por npm run build)
├── docs/                              # 📖 Documentación del proyecto (esta carpeta)
├── test/                              # 🧪 Pruebas unitarias y de integración (Vitest)
├── Dockerfile                         # 🐳 Receta de construcción de la imagen Docker
├── docker-compose.yml                 # 🚀 Orquestador de despliegue del contenedor
├── .dockerignore                      # 🛡️ Archivos excluidos del empaquetado Docker
├── .env / .env.example                # 🔑 Variables de entorno y credenciales
└── init-oracle.sql                    # 🗄️ Script SQL inicial para Oracle Database
```

### ¿Qué hace cada carpeta clave?

- **`src/`**: Es el corazón del backend.
  - **`src/main.ts`**: Inicializa NestJS, activa la validación global de datos, habilita CORS, sirve la carpeta `public/` como sitio web estático y levanta el servidor en el puerto 3000.
  - **`src/database/database.service.ts`**: Administra el ciclo de vida de la conexión a Oracle. Si la tabla no existe en la base de datos, la crea e inserta automáticamente los datos iniciales de Cars. Si no logra conectar, conmuta silenciosamente a un arreglo en memoria para que el sistema nunca deje de funcionar.
  - **`src/productos/productos.service.ts`**: Contiene la lógica CRUD completa. Decide si consultar/escribir en Oracle o en memoria según el estado de la conexión, garantizando siempre la continuidad del servicio.
- **`public/`**: Es el frontend cliente. Contiene la página visual que el usuario ve al entrar a `http://localhost:3000`. Al estar servida directamente por NestJS, no se requiere un servidor web adicional (como Nginx o Apache).
- **`dist/`**: Contiene el código resultante luego de compilar TypeScript a JavaScript puro con `npm run build`. En producción dentro de Docker, Node.js ejecuta los archivos de esta carpeta (`node dist/main.js`).

------------------------------------------------------------------------

## 🐳 4. ¿Por qué existen un `Dockerfile` y un `.yml` (Docker Compose)?

Ambos archivos cumplen funciones complementarias pero distintas:

| Concepto | `Dockerfile` | `docker-compose.yml` |
|:---|:---|:---|
| **Rol** | **Construir la imagen (El molde)** | **Desplegar y orquestar el contenedor (La ejecución)** |
| **Pregunta que resuelve** | *"¿Cómo se empaqueta la aplicación, qué dependencias necesita y cómo se compila?"* | *"¿Cómo debe correr el contenedor, en qué puerto, con qué contraseñas y en qué red?"* |
| **Equivalente manual** | `docker build -t gestor-crud-web:1.0 .` | `docker run -d -p 3000:3000 --network soc-net ...` |
| **Ventaja principal** | Crea una imagen inmutable, portátil y segura. | Permite levantar toda la configuración con un único comando reproducible: `docker compose up -d`. |

------------------------------------------------------------------------

## 🔍 5. Explicación Detallada de los Archivos Docker

### A. `Dockerfile` (Patrón Multi-stage Build y Seguridad)

El archivo `Dockerfile` está dividido en dos etapas (*Multi-stage build*):

``` dockerfile
# ========================================================
# Etapa 1: Compilación de TypeScript (builder)
# ========================================================
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias completas (incluyedevDependencies como TypeScript)
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar a JavaScript (/app/dist)
COPY . .
RUN npm run build

# ========================================================
# Etapa 2: Imagen final liviana de ejecución (runner)
# ========================================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Instalar ÚNICAMENTE dependencias de producción y limpiar caché
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar sólo los artefactos ya compilados y el frontend estático
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Seguridad: Ejecutar con el usuario estándar sin privilegios 'node'
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### ¿Por qué está configurado así y con qué propósito?

1.  **Multi-stage Build (Doble etapa):**
    - En la primera etapa (`builder`), se descargan herramientas de desarrollo pesadas (Nest CLI, compilador TypeScript, linters).
    - En la segunda etapa (`runner`), **se descartan todas las herramientas de compilación** y sólo se copian los archivos necesarios para ejecutar (`dist/` y `public/`), instalando únicamente librerías de producción (`--omit=dev`).
    - **Resultado:** La imagen final pesa una fracción del tamaño original, descarga más rápido y ahorra espacio en disco y memoria.
2.  **Imagen Base `node:20-slim`:**
    - En lugar de usar la imagen estándar de Node (que incluye paquetes innecesarios como compiladores de C++, utilidades de red o clientes pesados), `slim` contiene lo mínimo indispensable de Debian. Esto **reduce drásticamente la superficie de ataque** ante posibles vulnerabilidades del sistema operativo.
3.  **Seguridad con `USER node`:**
    - Por defecto, los contenedores Docker se ejecutan como `root`. Si un atacante lograra vulnerar la aplicación web, obtendría privilegios de superusuario dentro del contenedor.
    - Al declarar `USER node`, el proceso corre bajo un usuario estándar sin privilegios administrativos, cumpliendo el principio de menor privilegio (*Least Privilege*).

------------------------------------------------------------------------

### B. `.dockerignore`

``` plaintext
node_modules
dist
.git
.gitignore
.env
npm-debug.log
Dockerfile*
docker-compose*
README.md
docs/
```

#### Propósito:

- **Protección de Credenciales:** Evita que archivos confidenciales locales como `.env` (con contraseñas reales de base de datos) se copien dentro de la imagen de Docker.
- **Evitar Incompatibilidades:** Evita transferir la carpeta local `node_modules` (que pudo haber sido instalada en el sistema anfitrión) forzando una instalación limpia dentro del entorno Linux del contenedor.
- **Velocidad:** Reduce el volumen de datos que se envía al daemon de Docker al construir la imagen.

------------------------------------------------------------------------

### C. `docker-compose.yml`

``` yaml
services:
  web-crud:
    build:
      context: .
      dockerfile: Dockerfile
    image: gestor-crud-web:1.0
    container_name: gestor-crud-app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - DB_HOST=oracle-db
      - DB_PORT=1521
      - DB_SERVICE_NAME=FREEPDB1
      - DB_USER=usuario
      - DB_PASSWORD=MyPass123
    networks:
      - soc-net
    restart: unless-stopped

networks:
  soc-net:
    external: true
```

#### Desglose de cada configuración y su propósito:

1.  **`build` e `image`:**
    - `build: context: . dockerfile: Dockerfile`: Si la imagen no existe o se pasa `--build`, Docker la compila automáticamente usando el `Dockerfile` local.
    - `image: gestor-crud-web:1.0`: Asigna un nombre formal y versión a la imagen creada.
2.  **`container_name: gestor-crud-app`:**
    - Establece un identificador fijo y predecible para el contenedor, facilitando inspeccionarlo con `docker logs gestor-crud-app` o `docker exec -it gestor-crud-app sh`.
3.  **`ports: ["3000:3000"]`:**
    - Publica el puerto 3000 del contenedor hacia el puerto 3000 de la máquina física. Permite abrir `http://localhost:3000` en el navegador del host.
4.  **`environment`:**
    - Inyecta la configuración de conexión hacia Oracle sin modificar el código fuente:
      - `DB_HOST=oracle-db`: En Docker, los contenedores se comunican por su **nombre de servicio/contenedor** en la red interna, no por `localhost` ni por IPs fijas.
      - `DB_PORT=1521`: Puerto estándar del listener de Oracle.
      - `DB_SERVICE_NAME=FREEPDB1`: Pluggable Database predeterminada de Oracle 23ai / Free.
      - `DB_USER` y `DB_PASSWORD`: Credenciales de acceso.
5.  **`networks: soc-net` con `external: true`:**
    - En una arquitectura de microservicios o contenedores seguros, la base de datos corre en su propio contenedor (por ejemplo, `oracle-db`) conectado a una red privada llamada `soc-net`.
    - `external: true` le indica a Docker Compose que **la red ya fue creada previamente** y que este contenedor debe unirse a ella en lugar de crear una red aislada nueva. Esto permite que la aplicación web hable de forma directa y privada con Oracle sin exponer el puerto 1521 hacia internet.
6.  **`restart: unless-stopped`:**
    - Si la aplicación experimenta un fallo inesperado o el servidor se reinicia, Docker volverá a levantar el contenedor automáticamente a menos que haya sido detenido manualmente con `docker stop`.

------------------------------------------------------------------------

## 🚀 6. Guía Rápida de Comandos

### Despliegue con Docker Compose

``` bash
# 1. Crear la red compartida si aún no existe
docker network create soc-net 2>/dev/null || true

# 2. Construir la imagen y levantar el contenedor en segundo plano
docker compose up -d --build

# 3. Ver registros y logs de la aplicación
docker logs -f gestor-crud-app

# 4. Detener el contenedor
docker compose down
```

### Ejecución Local en Desarrollo (Sin Docker)

``` bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo con recarga automática
npm run start:dev

# 3. Abrir en el navegador:
# http://localhost:3000
```

------------------------------------------------------------------------

## 🔒 7. Endpoints de la API REST

| Método | Endpoint | Descripción |
|:---|:---|:---|
| `GET` | `/` | Interfaz Web del Garaje (Frontend Cars) |
| `GET` | `/api/productos` | Lista todos los bólidos (admite `?search=` y `?categoria=`) |
| `GET` | `/api/productos/:id` | Obtiene el detalle de un bólido por su ID |
| `POST` | `/api/productos` | Registra un nuevo bólido (validado con DTO) |
| `PUT` | `/api/productos/:id` | Modifica los datos de un bólido existente |
| `DELETE` | `/api/productos/:id` | Elimina un bólido de la parrilla |
| `GET` | `/api/database/status` | Diagnóstico de estado (Oracle vs In-Memory Fallback) |
| `POST` | `/api/database/reconnect` | Solicita un reintento manual de conexión a Oracle |
