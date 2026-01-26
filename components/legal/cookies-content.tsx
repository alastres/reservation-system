"use client";

import { useLocale } from "next-intl";

export function CookiesContent() {
    const locale = useLocale();

    if (locale === 'es') {
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2>Política de Cookies</h2>
                <p>Esta Política de Cookies explica cómo utilizamos cookies y tecnologías similares para reconocerle cuando visita nuestro sitio web.</p>

                <h3>¿Qué son las cookies?</h3>
                <p>Las cookies son pequeños archivos de datos que se colocan en su computadora o dispositivo móvil cuando visita un sitio web.</p>

                <h3>¿Por qué usamos cookies?</h3>
                <p>Utilizamos cookies por varias razones:</p>
                <ul>
                    <li><strong>Cookies esenciales:</strong> Necesarias para que el sitio funcione (ej. mantener su sesión activa).</li>
                    <li><strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo interactúa con el sitio.</li>
                    <li><strong>Cookies funcionales:</strong> Permiten recordar sus preferencias (como el idioma).</li>
                </ul>

                <h3>Control de cookies</h3>
                <p>Usted tiene el derecho de decidir si acepta o rechaza las cookies. Puede configurar los controles de su navegador web para aceptar o rechazar cookies.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>Cookies Policy</h2>
            <p>This Cookies Policy explains how we use cookies and similar technologies to recognize you when you visit our website.</p>

            <h3>What are cookies?</h3>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website.</p>

            <h3>Why do we use cookies?</h3>
            <p>We use cookies for several reasons:</p>
            <ul>
                <li><strong>Essential cookies:</strong> Necessary for the site to function (e.g. keeping you logged in).</li>
                <li><strong>Performance cookies:</strong> Help us understand how you interact with the site.</li>
                <li><strong>Functional cookies:</strong> Allow us to remember your preferences (like language).</li>
            </ul>

            <h3>Controlling cookies</h3>
            <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>
        </div>
    );
}
