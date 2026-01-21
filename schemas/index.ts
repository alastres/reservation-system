import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    name: z.string().min(1, {
        message: "Name is required",
    }),
});

export const ServiceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    price: z.number().min(0),
    locationType: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "IN_PERSON", "CUSTOM"]).default("GOOGLE_MEET"),
    locationUrl: z.string().optional(),
    address: z.string().optional(),
    location: z.string().optional(), // Keeping for backward compatibility or display
    url: z.string().min(1, {
        message: "URL slug is required"
    }).regex(/^[a-z0-9-]+$/, {
        message: "Only lowercase letters, numbers, and hyphens"
    }),
    color: z.string().min(1).default("#6366f1"),
    capacity: z.number().int().min(1).default(1),
    bufferTime: z.number().int().min(0).default(0),
    minNotice: z.number().int().min(0).default(60),
    isActive: z.boolean().default(true).optional(),
    customInputs: z.array(z.object({
        id: z.string(),
        label: z.string().min(1, "Label is required"),
        type: z.enum(["text", "textarea", "checkbox", "select"]),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional()
    })).optional().default([]),
    isRecurrenceEnabled: z.boolean().default(false),
    maxRecurrenceCount: z.number().int().min(1).default(4),
    requiresPayment: z.boolean().default(false),
});
