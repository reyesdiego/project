# ScoreTeam - Docker PostgreSQL Setup

Este archivo contiene las instrucciones para ejecutar PostgreSQL localmente usando Docker para la aplicación ScoreTeam.

## Prerrequisitos

- Docker instalado en tu sistema
- Docker Compose instalado (incluido con Docker Desktop)

## Opción 1: Usar Docker Compose (Recomendado)

### 1. Iniciar la base de datos

```bash
# Iniciar PostgreSQL y Adminer
docker-compose up -d

# Ver los logs
docker-compose logs -f postgres
```

### 2. Verificar que está funcionando

```bash
# Verificar que los contenedores están corriendo
docker-compose ps

# Debería mostrar:
# scoreteam-postgres  running  0.0.0.0:5432->5432/tcp
# scoreteam-adminer   running  0.0.0.0:8080->8080/tcp
```

### 3. Acceder a la base de datos

**Desde la aplicación:**
- Host: `localhost`
- Puerto: `5432`
- Base de datos: `scoreteam`
- Usuario: `postgres`
- Contraseña: `password`

**Desde Adminer (interfaz web):**
- URL: http://localhost:8080
- Sistema: PostgreSQL
- Servidor: postgres
- Usuario: postgres
- Contraseña: password
- Base de datos: scoreteam

### 4. Detener los servicios

```bash
# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: esto borra todos los datos)
docker-compose down -v
```

## Opción 2: Usar Dockerfile personalizado

### 1. Construir la imagen

```bash
docker build -f Dockerfile.postgres -t scoreteam-postgres .
```

### 2. Ejecutar el contenedor

```bash
docker run -d \
  --name scoreteam-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=scoreteam \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -v postgres_data:/var/lib/postgresql/data \
  scoreteam-postgres
```

## Estructura de la Base de Datos

La base de datos se inicializa automáticamente con:

### Tablas:
- `users` - Usuarios del sistema con roles
- `agents` - Agentes a evaluar
- `score_types` - Tipos de puntajes configurables
- `scores` - Puntajes asignados a los agentes

### Datos de Ejemplo:
- Usuario admin: `admin` / `admin123`
- Usuario evaluador: `evaluador` / `eval123`
- Usuario visualizador: `visualizador` / `view123`
- 6 agentes de ejemplo
- 8 tipos de puntajes
- Puntajes de ejemplo para el mes actual y anterior

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f postgres

# Conectar a PostgreSQL desde línea de comandos
docker exec -it scoreteam-postgres psql -U postgres -d scoreteam

# Hacer backup de la base de datos
docker exec scoreteam-postgres pg_dump -U postgres scoreteam > backup.sql

# Restaurar backup
docker exec -i scoreteam-postgres psql -U postgres scoreteam < backup.sql

# Reiniciar solo PostgreSQL
docker-compose restart postgres
```

## Solución de Problemas

### Puerto 5432 ya está en uso
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :5432

# Cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar puerto 5433 en lugar de 5432
```

### Problemas de permisos
```bash
# Dar permisos a los scripts de inicialización
chmod +x init-scripts/*.sql
```

### Limpiar todo y empezar de nuevo
```bash
# Detener y eliminar todo
docker-compose down -v
docker system prune -f

# Volver a iniciar
docker-compose up -d
```

## Configuración del Servidor Node.js

Asegúrate de que el archivo `server/.env` tenga la configuración correcta:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoreteam
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
PORT=3001
```