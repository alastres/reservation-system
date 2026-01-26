import nodemailer from "nodemailer";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

// Styles & Template Helper
const getHtmlTemplate = (title: string, bodyContent: string, actionLink?: { text: string; url: string }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937; line-height: 1.6; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            @media only screen and (max-width: 620px) {
                .container { margin: 0; border-radius: 0; width: 100% !important; }
            }
            .header { background-color: #4f46e5; padding: 24px; text-align: center; }
            .header h2 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; }
            .content { padding: 32px 24px; }
            .h1-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 24px; margin-top: 0; text-align: center; }
            .info-row { margin-bottom: 12px; line-height: 1.6; display: flex; align-items: flex-start; }
            .info-label { font-weight: 600; color: #4b5563; min-width: 80px; display: inline-block; margin-right: 8px; }
            .highlight-box { background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0; border-radius: 4px; }
            .button-container { text-align: center; margin-top: 32px; }
            .button { background-color: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block; transition: background-color 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .button:hover { background-color: #4338ca; }
            .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Scheduler Platform</h2>
            </div>
            <div class="content">
                <h1 class="h1-title">${title}</h1>
                ${bodyContent}
                ${actionLink ? `
                <div class="button-container">
                    <a href="${actionLink.url}" class="button">${actionLink.text}</a>
                </div>
                ` : ''}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Scheduler Platform. All rights reserved.</p>
                <p>This is an automated message, please do not reply directly.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const logNotification = async (userId: string, type: string, status: string, metadata: any) => {
    try {
        await prisma.notificationLog.create({
            data: { userId, type, status, metadata }
        });
    } catch (e) {
        console.error("Failed to log notification", e);
    }
}


export const sendBookingConfirmation = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    providerId: string,
    locationDetails?: string,
    clientTimeDisplay?: string
) => {
    let timeSection = `
        <div class="info-row"><span class="info-label">Date:</span> <span>${date}</span></div>
        <div class="info-row"><span class="info-label">Time:</span> <span>${time} (Provider's Time)</span></div>
    `;

    if (clientTimeDisplay) {
        timeSection += `
        <div class="highlight-box">
             <div style="font-weight: 600; color: #b45309; margin-bottom: 8px; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Time Zone Difference</div>
             <div><strong>Your Local Time:</strong> ${clientTimeDisplay}</div>
        </div>`;
    }

    const body = `
        <p>Hi ${name},</p>
        <p>Your booking for <strong>${serviceName}</strong> has been successfully confirmed.</p>
        
        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
            ${timeSection}
            ${locationDetails ? `<div class="info-row"><span class="info-label">Location:</span> <span>${locationDetails}</span></div>` : ''}
        </div>
        
        <p style="margin-top: 24px;">We look forward to seeing you!</p>
    `;

    const html = getHtmlTemplate("Booking Confirmed!", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: `Booking Confirmed: ${serviceName}`, html });
        await logNotification(providerId, "CLIENT_CONFIRMATION", "SENT", { email, name, serviceName, date, time });
    } catch (error) {
        console.error("Error sending email:", error);
        await logNotification(providerId, "CLIENT_CONFIRMATION", "FAILED", { error: String(error) });
    }
};

export const sendNewBookingNotification = async (
    providerEmail: string,
    providerId: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
    answers?: Record<string, string>,
    clientPhone?: string,
    locationDetails?: string
) => {
    const additionalInfo = answers && Object.keys(answers).length > 0 ? `
        <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <h3 style="font-size: 16px; margin-bottom: 12px;">Additional Information:</h3>
            ${Object.entries(answers).map(([key, value]) => `<div class="info-row"><span class="info-label">${key}:</span> <span>${value}</span></div>`).join('')}
        </div>
    ` : '';

    const body = `
        <p>You have a new booking from <strong>${clientName}</strong>.</p>
        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
            <div class="info-row"><span class="info-label">Service:</span> <span>${serviceName}</span></div>
            <div class="info-row"><span class="info-label">Date:</span> <span>${date}</span></div>
            <div class="info-row"><span class="info-label">Time:</span> <span>${time}</span></div>
            ${locationDetails ? `<div class="info-row"><span class="info-label">Location:</span> <span>${locationDetails}</span></div>` : ''}
            ${clientPhone ? `<div class="info-row"><span class="info-label">Phone:</span> <span>${clientPhone}</span></div>` : ''}
        </div>
        ${additionalInfo}
    `;

    const html = getHtmlTemplate("New Booking Received", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: providerEmail, subject: `New Booking: ${clientName} - ${serviceName}`, html });
        await logNotification(providerId, "BOOKING_RECEIVED", "SENT", { clientName, serviceName, date, time });
    } catch (error) {
        console.error("Error sending provider email:", error);
        await logNotification(providerId, "BOOKING_RECEIVED", "FAILED", { error: String(error) });
    }
}


export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;
    const body = `
        <p>We received a request to reset your password. Click the link below to verify your identity and set a new password:</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    `;
    const html = getHtmlTemplate("Reset your password", body, { text: "Reset Password", url: resetLink });

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: "Reset your password", html });
    } catch (error) {
        console.log(error);
    }
}

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;
    const body = `
        <p>Welcome! Please click the link below to confirm your email address and verify your account:</p>
    `;
    const html = getHtmlTemplate("Confirm your email", body, { text: "Confirm Email", url: confirmLink });

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: "Your Confirmation Code", html });
    } catch (error) {
        console.log("Error sending OTP:", error);
    }
}

export const sendOtpEmail = async (
    email: string,
    token: string,
) => {
    const body = `
        <p>Use the following code to verify your identity and confirm your booking:</p>
        <div style="text-align: center; margin: 32px 0;">
            <div style="background-color: #f3f4f6; padding: 16px 32px; border-radius: 8px; display: inline-block; border: 1px solid #e5e7eb;">
                <span style="letter-spacing: 8px; color: #111827; font-size: 32px; font-weight: 700;">${token}</span>
            </div>
        </div>
        <p style="font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
    `;
    const html = getHtmlTemplate("Confirm your Booking", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: "Your Confirmation Code", html });
    } catch (error) {
        console.log("Error sending OTP:", error);
    }
}

export const sendRescheduledBookingNotification = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    providerId: string,
    oldDate?: string,
    oldTime?: string
) => {
    const body = `
        <p>Hi ${name},</p>
        <p>Your booking for <strong>${serviceName}</strong> has been updated.</p>
        
        <div class="highlight-box" style="background-color: #ecfdf5; border-color: #10b981;">
            <div style="font-weight: 600; color: #047857; margin-bottom: 8px;">New Schedule</div>
            <div class="info-row"><span class="info-label">Date:</span> <span>${date}</span></div>
            <div class="info-row"><span class="info-label">Time:</span> <span>${time}</span></div>
        </div>

        ${oldDate && oldTime ? `<p style="color: #6b7280; font-size: 14px;">Previous: ${oldDate} at ${oldTime}</p>` : ''}
        
        <p>If this new time doesn't work for you, please contact us immediately.</p>
    `;

    const html = getHtmlTemplate("Booking Rescheduled", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: `Booking Rescheduled: ${serviceName}`, html });
        await logNotification(providerId, "CLIENT_RESCHEDULE", "SENT", { email, name, serviceName, date, time, oldDate, oldTime });
    } catch (error) {
        console.error("Error sending reschedule email:", error);
        await logNotification(providerId, "CLIENT_RESCHEDULE", "FAILED", { error: String(error) });
    }
};

export const sendCancellationNotification = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    providerId: string
) => {
    const body = `
        <p>Hi ${name},</p>
        <p>This email is to confirm that your booking for <strong>${serviceName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
        <p>If you have any questions or did not request this cancellation, please contact us.</p>
    `;

    const html = getHtmlTemplate("Booking Cancelled", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: `Booking Cancelled: ${serviceName}`, html });
        await logNotification(providerId, "CLIENT_CANCELLATION", "SENT", { email, name, serviceName, date, time });
    } catch (error) {
        console.error("Error sending cancellation email:", error);
        await logNotification(providerId, "CLIENT_CANCELLATION", "FAILED", { error: String(error) });
    }
};

export const sendBookingReminder = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    providerId: string,
    type: "24h" | "1h",
    bookingId: string,
    locationDetails?: string
) => {
    const subject = type === "24h"
        ? `Reminder: Your booking is tomorrow - ${serviceName}`
        : `Reminder: Your booking starts in 1 hour - ${serviceName}`;

    const body = `
        <p>Hi ${name},</p>
        <p>This is a reminder for your upcoming booking:</p>
        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
            <div class="info-row"><span class="info-label">Service:</span> <span>${serviceName}</span></div>
            <div class="info-row"><span class="info-label">Date:</span> <span>${date}</span></div>
            <div class="info-row"><span class="info-label">Time:</span> <span>${time}</span></div>
            ${locationDetails ? `<div class="info-row"><span class="info-label">Location:</span> <span>${locationDetails}</span></div>` : ''}
        </div>
        <p style="margin-top: 24px;">See you soon!</p>
    `;

    const html = getHtmlTemplate("Booking Reminder", body);

    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject, html });
        await logNotification(providerId, `REMINDER_${type.toUpperCase()}`, "SENT", { email, name, serviceName, date, time, bookingId });
    } catch (error) {
        console.error(`Error sending ${type} reminder email:`, error);
        await logNotification(providerId, `REMINDER_${type.toUpperCase()}`, "FAILED", { error: String(error), bookingId });
    }
};



export const sendInvitationEmail = async (email: string) => {
    const registerLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register`;

    const body = `
        <p>You have been invited to join <strong>Scheduler Platform</strong>.</p>
        <p>We are excited to have you on board! Click the button below to create your account and get started:</p>
        
        <div class="highlight-box">
             <div style="font-weight: 600; color: #4338ca; margin-bottom: 8px;">Why join us?</div>
             <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Manage your bookings automatically</li>
                <li>Accept payments online</li>
                <li>Sync with Google Calendar</li>
             </ul>
        </div>

        <p>If you did not expect this invitation, you can ignore this email.</p>
    `;

    const html = getHtmlTemplate("You're Invited!", body, { text: "Create Account", url: registerLink });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "You've been invited to Scheduler Platform",
            html
        });
        // We log it as a system action, maybe with a specific user ID or 'SYSTEM'
        // For now let's just log it if we can, or skip logging since we might not have a userId here easily passed down without context
        // await logNotification("SYSTEM", "INVITATION_SENT", "SENT", { email });
    } catch (error) {
        console.error("Error sending invitation email:", error);
    }
};
