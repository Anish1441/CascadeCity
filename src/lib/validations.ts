import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, "Phone must be in format +91XXXXXXXXXX");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be 6 digits");

export const userCreateSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(["lawmaker", "admin", "field_agent", "farmer"]),
  districtId: z.string().uuid().optional(),
});

export const alertCreateSchema = z.object({
  districtId: z.string().uuid(),
  type: z.enum(["heat", "water", "pest", "price", "emergency"]),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  message: z.string().min(10).max(500),
  farmerMessage: z.string().max(160).optional(),
  officerMessage: z.string().max(500).optional(),
  channel: z.enum(["sms", "whatsapp", "both"]),
  scheduledAt: z.string().datetime().optional(),
});

export const policyCreateSchema = z.object({
  districtId: z.string().uuid(),
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  benefitScore: z.number().min(0).max(100),
  costScore: z.number().min(0).max(100),
  feasibilityScore: z.number().min(0).max(100),
  impactDescription: z.string().optional(),
});

export const policyUpdateSchema = z.object({
  status: z.enum(["created", "in_progress", "completed"]).optional(),
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(20).optional(),
  impactDescription: z.string().optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1).max(100),
  language: z.enum(["en", "mr", "hi"]).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
