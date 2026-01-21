-- Script para actualizar manualmente el stripeCustomerId
-- El customer ID de Stripe es: cus_TpezdeIHVyls0W
-- Ejecuta este script en tu base de datos

-- Primero verifica qué usuario tiene la suscripción
SELECT id, email, "stripeCustomerId", "subscriptionStatus" 
FROM "User" 
WHERE email = 'dinerofacilmail@gmail.com';

-- Luego actualiza el stripeCustomerId
UPDATE "User" 
SET "stripeCustomerId" = 'cus_TpezdeIHVyls0W',
    "subscriptionStatus" = 'ACTIVE'
WHERE email = 'dinerofacilmail@gmail.com';

-- Verifica que se actualizó correctamente
SELECT id, email, "stripeCustomerId", "subscriptionStatus", "subscriptionPlan"
FROM "User" 
WHERE email = 'dinerofacilmail@gmail.com';
