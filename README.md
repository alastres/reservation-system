# Plataforma SaaS de Reservas (Next.js 16)

Una plataforma profesional de programación de citas de marca blanca construida con **Next.js 16**. Permite a los profesionales (Dueños) gestionar sus servicios, disponibilidad y pagos, mientras ofrece a los Clientes una experiencia de reserva fluida. Similar a Calendly, pero auto-hospedado y totalmente personalizable.

![Vista Previa del Dashboard](public/dashboard-preview.png)

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- **Autenticación Multi-método**: Soporta Google OAuth, Email/Contraseña y Enlaces Mágicos (vía **Auth.js / NextAuth v5**).
- **Verificación OTP**: Verificación segura en 2 pasos para el registro por correo electrónico.
- **Control de Acceso Basado en Roles (RBAC)**: Portales distintos para **Administradores**, **Dueños** (Proveedores) y **Clientes**.
- **Mejores Prácticas de Seguridad**:
  - **Rate Limiting**: Protección basada en middleware contra abusos.
  - **Prevención de Spam**: Campos Honeypot e implementación de CAPTCHA.
  - **Validación de Entradas**: Validación estricta de esquemas usando **Zod**.

### 📅 Motor de Reservas
- **Servicios Flexibles**: Configura duración, precio, capacidad (1 a 1 o Grupos) y ubicación (Google Meet, Número de teléfono, En persona).
- **Disponibilidad Híbrida**:
  - **Reglas Semanales**: Establece horarios de operación recurrentes (ej: Lun-Vie 9-5).
  - **Excepciones por Fecha**: Anula fechas específicas para vacaciones o tiempo libre.
  - **Sincronización con Google Calendar**: Sincronización bidireccional para evitar dobles reservas.
- **Lógica Inteligente**:
  - **Conversión de Zona Horaria**: Detecta automáticamente la zona horaria del cliente.
  - **Gestión de Concurrencia**: Límites globales (ej: "máximo 3 reservas al mismo tiempo") vs límites por Servicio.
  - **Tiempos de Buffer**: Espacios automáticos entre citas.

### 💰 Pagos y Monetización (Stripe)
- **Pagos Directos**: Los clientes pagan por adelantado para confirmar reservas.
- **Stripe Connect (Express)**:
  - **Onboarding**: Los dueños conectan sus propias cuentas de Stripe a través de un flujo de incorporación dedicado.
  - **Pagos Automáticos**: Los fondos se envían directamente a la cuenta bancaria del Dueño.
  - **Tarifas de Plataforma**: (Opcional) La plataforma puede cobrar un % de cada transacción.
- **Suscripciones SaaS**: Modelo de negocio donde los Dueños pagan una tarifa mensual/anual por usar la plataforma.
- **Webhooks**: Actualizaciones de estado en tiempo real (Pago Exitoso, Suscripción Actualizada).

### 🌍 Internacionalización (i18n)
- **Soporte Multilingüe**: Totalmente traducido a **Inglés (EN)** y **Español (ES)**, incluyendo componentes de servidor y cliente.
- **Detección de Configuración Regional**: El middleware redirige automáticamente a los usuarios según la preferencia del navegador.
- **Contenido Localizado**: Todos los correos electrónicos, mensajes de error y elementos de la interfaz de usuario están adaptados.

### ⚙️ Automatización y Analíticas
- **Cron Jobs**: Tareas en segundo plano para enviar **Recordatorios de Citas de 24h y 1h** (vía Vercel Cron).
- **Notificaciones por Correo**: Correos transaccionales vía **Resend / Nodemailer** (Confirmaciones, Cancelaciones, Recordatorios).
- **Analíticas del Dashboard**: Gráficos interactivos (Recharts) para Ingresos, Volumen de Reservas y Servicios Populares.

### 🎨 UX/UI Moderno
- **Interfaz Premium**: Construida con **Tailwind CSS 4** y componentes de **Shadcn/UI**.
- **Animaciones Suaves**: Utilizando **Framer Motion** para una experiencia de usuario dinámica.
- **Feedback Visual**: Notificaciones tipo toast elegantes con **Sonner**.
- **Entrada de Teléfono**: Manejo robusto de números internacionales con `react-phone-number-input`.

---

## 🛠 Tecnologías

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (vía [Neon](https://neon.tech) o Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Auth.js (NextAuth v5 Beta)](https://authjs.dev/)
- **Pagos**: [Stripe](https://stripe.com/) & Stripe Connect
- **Correo**: [Resend](https://resend.com/) & [Nodemailer](https://nodemailer.com/)
- **UI/Estilos**: [TailwindCSS 4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Validación**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Internacionalización**: [next-intl](https://next-intl-docs.vercel.app/)
- **Gestión de Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Fechas**: [Date-fns](https://date-fns.org/) & [React Day Picker](https://react-day-picker.js.org/)

---

## 📦 Comenzando

### 1. Prerrequisitos
- Node.js 18+
- URL de Base de Datos PostgreSQL
- Cuenta de Stripe (con Connect habilitado)
- Proyecto de Google Cloud (para API de Calendar y Auth)
- Clave API de Resend

### 2. Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/reservation-system.git
cd reservation-system

# Instalar dependencias
npm install

# Inicializar Base de Datos
npx prisma generate
npx prisma db push
```

### 3. Configuración del Entorno

Renombra `.env.example` a `.env` y configura lo siguiente:

#### Core
```env
DATABASE_URL="postgresql://usuario:pass@host/db?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Usa https://tu-dominio.com en producción
```

#### Autenticación (NextAuth)
```env
AUTH_SECRET="generar-con-openssl-rand-base64-32"
# Google OAuth
AUTH_GOOGLE_ID="tu-client-id"
AUTH_GOOGLE_SECRET="tu-client-secret"
```

#### Pagos (Stripe)
Ve al Dashboard de Stripe > Desarrolladores > Claves API.
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# IDs de Productos (Créalos en Productos del Dashboard de Stripe)
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_QUARTERLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
```

#### Integración con Google Calendar
Requerido para sincronización de 2 vías. Habilita **Google Calendar API** en Cloud Console.
```env
GOOGLE_CLIENT_ID="mismo-que-auth-id"
GOOGLE_CLIENT_SECRET="mismo-que-auth-secret"
```

#### Correo (Resend)
```env
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev" # O tu dominio verificado
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_..."
```

---

## 🚀 Guía de Configuración

### Configuración de Google Cloud
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Habilita **Google Calendar API**.
3. Ve a **Credenciales** > **Crear credenciales** > **ID de cliente de OAuth**.
4. Configura URIs de redirección autorizados:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://your-domain.com/api/auth/callback/google`
5. Copia el ID de Cliente y el Secreto al `.env`.

### Configuración de Stripe Connect
1. Ve al Dashboard de Stripe > **Connect**.
2. Habilita cuentas **Express**.
3. En **Configuración de la entrada** > **Redireccionamientos**, añade:
   - `http://localhost:3000/api/stripe/connect/refresh`
   - `http://localhost:3000/api/stripe/connect/return`
   - (Y los equivalentes completos de producción)
4. Usa la `STRIPE_SECRET_KEY` en tu `.env`.

### Despliegue en Vercel y Cron Jobs
1. **Push a GitHub**.
2. **Importar a Vercel**: Selecciona el repositorio.
3. **Variables de Entorno**: Copia todas las variables del `.env`.
4. **Cron Jobs**:
   - El proyecto incluye un archivo `vercel.json` definiendo el horario del cron (`/api/cron/reminders`).
   - Vercel detecta esto automáticamente.
   - Puedes asegurar el endpoint del cron añadiendo una var de entorno `CRON_SECRET` (implementación opcional).

---

## 🏃‍♂️ Ejecutando el Proyecto

### Desarrollo
```bash
npm run dev
# Visita http://localhost:3000
```

### Build de Producción
```bash
npm run build
npm start
```

### Scripts de Utilidad
La carpeta `scripts/` contiene scripts de ayuda para verificación (excluidos del build):
- `npm run check-tz`: Verifica el manejo de zonas horarias.
- `npm run verify-all`: corre una verificación completa del build.

---

## 📄 Licencia

Licencia MIT.
