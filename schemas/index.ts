import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "email",
    }),
    password: z.string().min(1, {
        message: "required",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "email",
    }),
    password: z.string().min(6, {
        message: "password_min",
    }),
    name: z.string().min(1, {
        message: "name_required",
    }),
    timeZone: z.string().optional(),
    termsAccepted: z.boolean().default(false).refine((val) => val === true, {
        message: "terms_required",
    }),
    website: z.string().optional(), // Honeypot field
});

export const ServiceSchema = z.object({
    title: z.string().min(1, "title_required"),
    description: z.string().optional(),
    duration: z.number().min(1, "duration_min"),
    price: z.number().min(0, "price_min"),
    locationType: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "IN_PERSON", "CUSTOM"]).default("GOOGLE_MEET"),
    locationUrl: z.string().optional(),
    address: z.string().optional(),
    location: z.string().optional(), // Keeping for backward compatibility or display
    url: z.string().min(1, {
        message: "url_slug_required"
    }).regex(/^[a-z0-9-]+$/, {
        message: "url_slug_regex"
    }),
    color: z.string().min(1).default("#6366f1"),
    capacity: z.number().int().min(1).default(1),
    bufferTime: z.number().int().min(0).default(0),
    minNotice: z.number().int().min(0).default(60),
    isActive: z.boolean().default(true).optional(),
    customInputs: z.array(z.object({
        id: z.string(),
        label: z.string().min(1, "label_required"),
        type: z.enum(["text", "textarea", "checkbox", "select"]),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional()
    })).optional().default([]),
    isRecurrenceEnabled: z.boolean().default(false),
    maxRecurrenceCount: z.number().int().min(1).default(4),
    requiresPayment: z.boolean().default(false),
    isConcurrencyEnabled: z.boolean().default(false),
    maxConcurrency: z.number().int().min(1).default(1),
    userId: z.string().optional(),
});
