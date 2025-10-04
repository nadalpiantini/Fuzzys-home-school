# 📧 Configuración de Resend para Emails

## 1️⃣ Crear cuenta en Resend

1. Ve a: https://resend.com
2. Crea una cuenta gratuita (plan gratuito incluye 3,000 emails/mes)
3. Verifica tu email

## 2️⃣ Obtener API Key

1. En el dashboard de Resend, ve a: **Settings > API Keys**
2. Clic en **Create API Key**
3. Nombre: `Fuzzy Home School Production`
4. Permisos: **Sending access** (Full Access)
5. Copia la API key (formato: `re_xxxxxxxxxxxxxxxxxx`)

## 3️⃣ Configurar variables de entorno

### Local Development

Edita `apps/web/.env.local`:

```bash
# Resend API Key
RESEND_API_KEY=re_tu_api_key_aqui
```

### Vercel Production

```bash
vercel env add RESEND_API_KEY
```

O desde Vercel Dashboard:
1. Ve a: https://vercel.com/nadalpiantini/fuzzys-home-school/settings/environment-variables
2. Agregar nueva variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_tu_api_key_aqui`
   - **Environment:** Production, Preview, Development

## 4️⃣ Configurar dominio (Opcional pero Recomendado)

### Con Dominio Verificado

1. En Resend Dashboard, ve a **Settings > Domains**
2. Clic en **Add Domain**
3. Ingresa tu dominio: `fuzzyhomeschool.com` (o el que tengas)
4. Agrega los registros DNS que Resend te proporciona:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

5. Espera verificación (puede tomar hasta 24 horas)

6. Una vez verificado, actualiza el código en:
   `apps/web/src/app/api/parents/send-report/route.ts`

```typescript
const { data: emailData, error: emailError } = await resend.emails.send({
  from: 'Fuzzy\'s Home School <noreply@fuzzyhomeschool.com>', // Usar tu dominio
  to: [parentProfile.email],
  subject: `📊 Reporte Semanal - ${formatDate(weekStart)} a ${formatDate(now)}`,
  react: WeeklyReportEmail({...}),
});
```

### Sin Dominio (Desarrollo)

Por defecto, el código usa `onboarding@resend.dev` que es un dominio de prueba de Resend.

⚠️ **Limitación:** Los emails desde `resend.dev` pueden ir a spam. Solo para desarrollo.

## 5️⃣ Probar envío de email

### Opción A: Desde la aplicación

1. Inicia sesión como padre en la app
2. Ve al Dashboard de Padres: `/parent/dashboard`
3. Clic en **Enviar Reporte**
4. Revisa tu bandeja de entrada

### Opción B: Con curl

```bash
curl -X POST http://localhost:3000/api/parents/send-report \
  -H "Content-Type: application/json" \
  -d '{"parentId": "uuid-del-padre"}'
```

### Opción C: Desde Resend Dashboard

Revisa los emails enviados en: https://resend.com/emails

## 6️⃣ Configuración de Production

### Vercel (Recomendado)

Después de configurar la variable de entorno en Vercel:

```bash
vercel --prod
```

### Verificación

1. Revisa logs en Resend Dashboard
2. Verifica delivery status
3. Revisa métricas de apertura/clicks (si están habilitadas)

## 🔒 Mejores Prácticas

### Seguridad

- ✅ Nunca commitees el API key al repositorio
- ✅ Usa variables de entorno
- ✅ Rota el API key cada 90 días
- ✅ Usa dominios verificados en producción

### Deliverability

- ✅ Verifica tu dominio con SPF/DKIM/DMARC
- ✅ Usa un dominio dedicado para transactional emails
- ✅ Mantén bounce rate < 5%
- ✅ Monitorea spam complaints

### Testing

- ✅ Usa `re_development_key` en tests
- ✅ Prueba con múltiples clientes de email (Gmail, Outlook, Apple Mail)
- ✅ Verifica que las imágenes se carguen correctamente
- ✅ Prueba la versión móvil del email

## 📊 Monitoreo

### Métricas clave a monitorear

- **Delivery Rate:** % de emails entregados exitosamente
- **Open Rate:** % de emails abiertos (si tienes tracking habilitado)
- **Bounce Rate:** % de emails rebotados
- **Spam Rate:** % de emails marcados como spam

### Dashboard de Resend

- Ve logs en tiempo real
- Revisa errores de delivery
- Analiza tendencias de envío

## 🚨 Troubleshooting

### Error: "Invalid API Key"

- Verifica que el API key esté correctamente configurado en `.env.local`
- Asegúrate de que no tenga espacios extras
- Confirma que el key sea válido en Resend Dashboard

### Error: "Email not sent"

- Revisa los logs de Resend Dashboard
- Verifica que el email del destinatario sea válido
- Confirma que no hayas excedido el rate limit

### Emails van a spam

- Configura SPF/DKIM/DMARC
- Usa un dominio verificado
- Evita palabras spam en subject/body
- Mantén buena reputación del dominio

## 📚 Recursos

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [React Email Components](https://react.email)
- [Email Best Practices](https://resend.com/docs/send-with-react)
