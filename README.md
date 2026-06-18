# Drive Clone

Clon de Google Drive que permite subir archivos mediante drag & drop, visualizar los 3 más recientes y descargarlos. Los archivos se almacenan en un bucket S3 instanciado en LocalStack.

## Herramientas necesarias

Instala estas herramientas antes de continuar. Puedes verificar si ya las tienes con los comandos indicados.

| Herramienta | Verificar | Descargar |
|---|---|---|
| Docker Desktop | `docker --version` | https://www.docker.com/products/docker-desktop |
| Terraform | `terraform --version` | https://developer.hashicorp.com/terraform/install |
| Node.js >= 20 | `node --version` | https://nodejs.org |
| AWS CLI | `aws --version` | https://aws.amazon.com/cli/ |

---

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd TALLER3_Cloud
```

---

## 2. Instalar dependencias

Dentro de la carpeta del proyecto, ejecuta estos comandos en orden:

```bash
cd backend
npm install
cd ..
cd frontend
npm install
cd ..
```

---

## 3. Variables de entorno

No es necesario crear ningún archivo `.env`. Todas las variables ya están configuradas en el `docker-compose.yml`.

A modo informativo, estas son las variables que usa el backend:

| Variable | Valor | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del backend |
| `AWS_REGION` | `us-east-1` | Región de AWS (LocalStack la ignora) |
| `AWS_ENDPOINT` | `http://localstack:4566` | Endpoint de LocalStack dentro de Docker |
| `AWS_ACCESS_KEY_ID` | `test` | Credencial ficticia aceptada por LocalStack |
| `AWS_SECRET_ACCESS_KEY` | `test` | Credencial ficticia aceptada por LocalStack |
| `BUCKET_NAME` | `drive-clone-bucket` | Nombre del bucket S3 |

Y esta es la variable del frontend:

| Variable | Valor | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL del backend vista desde el navegador |

---

## 4. Levantar los servicios con Docker

Desde la carpeta raíz del proyecto (`TALLER3_Cloud/`):

```bash
docker compose up --build
```

Este comando construye las imágenes y levanta tres servicios:
- **LocalStack** en el puerto `4566` (emula S3 de AWS)
- **Backend** en el puerto `3001`
- **Frontend** en el puerto `3000`

Espera hasta ver este mensaje en los logs antes de continuar:

```
localstack  | Ready.
```

---

## 5. Crear el bucket S3 con Terraform

Abre una terminal nueva (sin cerrar la del paso anterior) y ejecuta:

```bash
cd TALLER3_Cloud/terraform
terraform init
terraform apply -auto-approve
```

Al terminar deberías ver:

```
bucket_name = "drive-clone-bucket"
```

Eso confirma que el bucket fue creado correctamente en LocalStack.

---

## 6. Usar la aplicación

Abre el navegador en:

```
http://localhost:3000
```

Flujo de uso:
1. Arrastra un archivo sobre la zona punteada o haz clic para seleccionarlo
2. Presiona el botón **Cargar**
3. El archivo aparece en la sección de recientes
4. Presiona **Descargar** para descargarlo

---

## 7. Verificar el bucket (opcional)

Si quieres confirmar que los archivos están guardados en S3, primero configura AWS CLI con credenciales ficticias (solo la primera vez):

```bash
aws configure
```

Ingresa estos valores:
```
AWS Access Key ID: test
AWS Secret Access Key: test
Default region name: us-east-1
Default output format: (Enter)
```

Luego ejecuta:

```bash
# Ver que el bucket existe
aws --endpoint-url=http://localhost:4566 s3 ls

# Ver los archivos dentro del bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://drive-clone-bucket --recursive
```

---

## Nota importante

LocalStack no persiste datos cuando se reinicia. Si detienes Docker y lo vuelves a levantar, debes repetir el paso 5 (`terraform apply -auto-approve`) para recrear el bucket.