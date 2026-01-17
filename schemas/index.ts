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
    location: z.string().optional(),
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
});
