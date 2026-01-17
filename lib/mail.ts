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
    time: string
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
    time: string
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
