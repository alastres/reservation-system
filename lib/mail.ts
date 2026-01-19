import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

import { prisma } from "@/lib/prisma";

export const sendBookingConfirmation = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    locationDetails?: string
) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Booking Confirmed: ${serviceName}`,
        html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Your booking for <strong>${serviceName}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      ${locationDetails ? `<p><strong>Location:</strong> ${locationDetails}</p>` : ''}
      <p>See you there!</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        // We could try to log if email matches a user, but for now specific logging for providers is prioritized
    } catch (error) {
        console.error("Error sending email:", error);
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
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: providerEmail,
        subject: `New Booking: ${clientName} - ${serviceName}`,
        html: `
      <h1>New Booking Received</h1>
      <p>You have a new booking from <strong>${clientName}</strong>.</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      ${locationDetails ? `<p><strong>Location:</strong> ${locationDetails}</p>` : ''}
      ${clientPhone ? `<p><strong>Phone:</strong> ${clientPhone}</p>` : ''}
      
      ${answers && Object.keys(answers).length > 0 ? `
        <h3>Additional Information:</h3>
        <ul>
          ${Object.entries(answers).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
        </ul>
      ` : ''}
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        await logNotification(providerId, "BOOKING_RECEIVED", "SENT", { clientName, serviceName, date, time });
    } catch (error) {
        console.error("Error sending provider email:", error);
        await logNotification(providerId, "BOOKING_RECEIVED", "FAILED", { error: String(error) });
    }
}

const logNotification = async (userId: string, type: string, status: string, metadata: any) => {
    try {
        await prisma.notificationLog.create({
            data: {
                userId,
                type,
                status,
                metadata
            }
        });
    } catch (e) {
        console.error("Failed to log notification", e);
    }
}

export const sendPasswordResetEmail = async (
    email: string,
    token: string,
) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

export const sendVerificationEmail = async (
    email: string,
    token: string,
) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Confirm your email",
        html: `
        <h1>Confirm your email</h1>
        <p>Click the link below to confirm your email:</p>
        <a href="${confirmLink}">Confirm Email</a>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

export const sendRescheduledBookingNotification = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string,
    oldDate?: string,
    oldTime?: string
) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Booking Rescheduled: ${serviceName}`,
        html: `
      <h1>Booking Update</h1>
      <p>Hi ${name},</p>
      <p>Your booking for <strong>${serviceName}</strong> has been rescheduled.</p>
      ${oldDate && oldTime ? `<p style="color: gray; text-decoration: line-through;">Previous: ${oldDate} at ${oldTime}</p>` : ''}
      <p><strong>New Date:</strong> ${date}</p>
      <p><strong>New Time:</strong> ${time}</p>
      <p>If this new time doesn't work for you, please contact us.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending reschedule email:", error);
    }
};

export const sendCancellationNotification = async (
    email: string,
    name: string,
    serviceName: string,
    date: string,
    time: string
) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Booking Cancelled: ${serviceName}`,
        html: `
      <h1>Booking Cancelled</h1>
      <p>Hi ${name},</p>
      <p>Your booking for <strong>${serviceName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
      <p>If you did not request this cancellation, please contact us immediately.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending cancellation email:", error);
    }
};
