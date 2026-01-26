"use client";

import { useLocale } from "next-intl";

export function TermsContent() {
    const locale = useLocale();

    if (locale === 'es') {
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2>1. Introducción</h2>
                <p>Bienvenido a Scheduler (la "Plataforma"). Al acceder o utilizar nuestro sitio web y servicios, usted acepta cumplir y estar legalmente obligado por los siguientes Términos y Condiciones ("Términos").</p>

                <h2>2. Uso del Servicio</h2>
                <p>Usted se compromete a utilizar la Plataforma únicamente para fines legales y de acuerdo con estos Términos. Se prohíbe cualquier uso que pueda dañar, deshabilitar o sobrecargar nuestros servicios.</p>

                <h2>3. Cuentas de Usuario</h2>
                <p>Para acceder a ciertas funciones, debe registrarse y crear una cuenta. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.</p>

                <h2>4. Pagos y Suscripciones</h2>
                <p>Algunos servicios pueden requerir pago. Al suscribirse, usted acepta pagar las tarifas aplicables. Nos reservamos el derecho de modificar nuestros precios con previo aviso.</p>

                <h2>5. Propiedad Intelectual</h2>
                <p>Todo el contenido, marcas y logotipos presentes en la Plataforma son propiedad de Scheduler o sus licenciantes y están protegidos por leyes de propiedad intelectual.</p>

                <h2>6. Limitación de Responsabilidad</h2>
                <p>Scheduler no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso o la imposibilidad de uso de la Plataforma.</p>

                <h2>7. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación.</p>

                <h2>8. Contacto</h2>
                <p>Si tiene preguntas sobre estos Términos, contáctenos a través de nuestro soporte.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>Welcome to Scheduler (the "Platform"). By accessing or using our website and services, you agree to comply with and be bound by the following Terms and Conditions ("Terms").</p>

            <h2>2. Use of Service</h2>
            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. Any use that may damage, disable, or overburden our services is prohibited.</p>

            <h2>3. User Accounts</h2>
            <p>To access certain features, you must register and create an account. You are responsible for maintaining the confidentiality of your account and password.</p>

            <h2>4. Payments and Subscriptions</h2>
            <p>Some services may require payment. By subscribing, you agree to pay the applicable fees. We reserve the right to modify our prices with prior notice.</p>

            <h2>5. Intellectual Property</h2>
            <p>All content, trademarks, and logos present on the Platform are property of Scheduler or its licensors and are protected by intellectual property laws.</p>

            <h2>6. Limitation of Liability</h2>
            <p>Scheduler shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the Platform.</p>

            <h2>7. Amendments</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting.</p>

            <h2>8. Contact</h2>
            <p>If you have questions about these Terms, please contact us via our support.</p>
        </div>
    );
}
