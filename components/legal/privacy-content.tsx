"use client";

import { useLocale } from "next-intl";

export function PrivacyContent() {
    const locale = useLocale();

    if (locale === 'es') {
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2>1. Recopilación de Información</h2>
                <p>Recopilamos información que usted nos proporciona directamente, como su nombre, dirección de correo electrónico y datos de pago al registrarse.</p>

                <h2>2. Uso de la Información</h2>
                <p>Utilizamos su información para operar, mantener y mejorar nuestros servicios, procesar transacciones y comunicarnos con usted.</p>

                <h2>3. Cookies y Tecnologías Similares</h2>
                <p>Utilizamos cookies para personalizar su experiencia y analizar el tráfico de nuestro sitio. Usted puede controlar el uso de cookies a través de la configuración de su navegador.</p>

                <h2>4. Compartir Información</h2>
                <p>No vendemos su información personal. Podemos compartir información con proveedores de servicios externos que nos ayudan a operar nuestro negocio (ej. procesadores de pago).</p>

                <h2>5. Seguridad de Datos</h2>
                <p>Implementamos medidas de seguridad razonables para proteger su información contra acceso no autorizado, alteración o destrucción.</p>

                <h2>6. Sus Derechos</h2>
                <p>Usted tiene derecho a acceder, corregir o eliminar su información personal. Puede ejercer estos derechos contactándonos directamente.</p>

                <h2>7. Cambios en la Política</h2>
                <p>Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos cualquier cambio material a través de la Plataforma.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Information Collection</h2>
            <p>We collect information you provide directly to us, such as your name, email address, and payment information when you register.</p>

            <h2>2. Use of Information</h2>
            <p>We use your information to operate, maintain, and improve our services, process transactions, and communicate with you.</p>

            <h2>3. Cookies and Similar Technologies</h2>
            <p>We use cookies to personalize your experience and analyze our site traffic. You can control the use of cookies through your browser settings.</p>

            <h2>4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with third-party service providers who help us operate our business (e.g., payment processors).</p>

            <h2>5. Data Security</h2>
            <p>We implement reasonable security measures to protect your information against unauthorized access, alteration, or destruction.</p>

            <h2>6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can exercise these rights by contacting us directly.</p>

            <h2>7. Changes to Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of any material changes through the Platform.</p>
        </div>
    );
}
