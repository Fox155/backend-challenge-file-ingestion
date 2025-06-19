# 🧪 Challenge Técnico – Solución Backend (Node.js)

Esta es una solución al desafío técnico para procesar un archivo de gran tamaño, validando sus registros e insertándolos en una base de datos SQL Server.

## 📝 Descripción del Proyecto

La solución está desarrollada en **TypeScript** y sigue los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)**.

La estrategia principal para manejar archivos grandes con recursos limitados se basa en:

1.  **Procesamiento por streams:** El archivo se lee línea por línea, en lugar de cargalo por completo en memoria. Esto garantiza un uso de memoria bajo y constante, independientemente del tamaño del archivo.

2.  **Inserción por lotes (bulk):** Los registros validados se agrupan en lotes y se insertan mediante una única operación de tipo `bulk`, lo que minimiza la carga en la base de datos.

## ✨ Características Principales

- **Tolerancia a fallos:** Las líneas corruptas del archivo se registran y se omiten sin detener el proceso.
- **Endpoint Health:** El endpoint `/health` permanece operativo y responde incluso durante el procesamiento del archivo.
- **Arquitectura:** Separación clara entre dominio, aplicación e infraestructura.
- **Inserción por lotes:** Uso de `BULK INSERT` para un rendimiento óptimo.
- **Entorno Dockerizado:** Totalmente orquestado con Docker y Docker Compose para un despliegue y desarrollo sencillos.

## 📂 Estructura del Proyecto

```
src/
├── domain/         # Entidades y reglas de negocio puras.
├── config/         # Configuraciones de la aplicación.
├── application/    # Casos de uso y puertos (interfaces).
├── infrastructure/ # Implementaciones: SQL, Express, Lectura de archivos.
├── application/    # Casos de uso y puertos (interfaces).
└── main.ts         # Punto de entrada de la aplicación.
```

## 🚀 Cómo Empezar

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v24 o superior)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)

### Paso 1: Configuración

1.  **Crea el archivo de entorno:**
    Copia el siguiente contenido y guárdalo en un archivo `.env` en la raíz del proyecto.

    Docker

    ```dosini
    # Server
    PORT=3000

    # DB
    DB_SERVER=db
    DB_PORT=1433
    DB_USER=sa
    DB_PASSWORD=Password123
    DB_NAME=challenge

    # Ruta del archivo de entrada DENTRO del contenedor
    FILE_PATH=challenge/input/CLIENTES_IN_0425.dat

    # Tamaño del lote
    BATCH_SIZE=1000
    ```

    Local

    ```dosini
    # Server
    PORT=3001

    # DB
    DB_SERVER=localhost
    DB_PORT=1433
    DB_USER=sa
    DB_PASSWORD=Password123
    DB_NAME=challenge

    # Ruta del archivo de entrada
    FILE_PATH=./challenge/input/CLIENTES_IN_0425.dat

    # Tamaño del lote
    BATCH_SIZE=1000
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

### Paso 2: Generar el archivo de prueba

Existe un proyecto hermano que incluye un script para generar el archivo `CLIENTES_IN_0425.dat` con datos de prueba.

1.  **Configura los parámetros (opcional):**
    Puedes modificar la cantidad de registros y el porcentaje de errores en `src/generateFile.ts`.

2.  **Ejecuta el generador:**
    ```bash
    npx ts-node src/generateFile.ts
    ```
    Esto creará el archivo en `challenge/input/CLIENTES_IN_0425.dat`.

### Paso 3: Ejecutar

Puedes ejecutar la solución de dos maneras:

#### A) Usando Docker

Este método levanta un entorno completo con la aplicación y la base de datos.

1.  **Construye e inicia los contenedores:**

    ```bash
    docker-compose up --build
    ```

    Este comando hará lo siguiente:

    - Construirá la imagen de Docker para la aplicación Node.js.
    - Iniciará un contenedor para SQL Server.
    - Esperará a que la base de datos esté lista.
    - Ejecutará el script `schema.sql` para crear la tabla `Clientes`.
    - Iniciará el contenedor de la aplicación, que comenzará a procesar el archivo.

2.  **Verifica el estado:**

    - **Logs de la aplicación:** `docker logs -f challenge-app`
    - **Health Check:** Abre en tu navegador `http://localhost:3000/health`. Deberías ver una respuesta JSON con el estado "ok".

3.  **Detener el entorno:**
    Para detener y eliminar los contenedores y la red, presiona `Ctrl + C` y luego ejecuta:
    ```bash
    docker-compose down -v
    ```

#### B) De forma local

1.  **Iniciar solo la base de datos con Docker:**

    ```bash
    docker-compose up -d db
    ```

2.  **Asegúrate de tener un archivo `.env`** con la configuración para la conexión a `localhost`.

3.  **Ejecuta la aplicación:**

    Se puede corre la aplicación con el siguiente comando:

    ```bash
    npm run start
    ```

4.  **Verifica el estado:**
    - **Logs:** Verás la salida directamente en tu terminal.
    - **Health Check:** Abre `http://localhost:3001/health` (o el puerto que hayas configurado en `.env`).
