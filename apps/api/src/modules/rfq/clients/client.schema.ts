// @ts-nocheck
import { z } from 'zod';

// Helper: accept null or empty string and coerce to undefined
const optionalString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v === null || v === '' ? undefined : v));

const optionalEmail = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v === null || v === '' ? undefined : v))
  .pipe(z.string().email().optional());

const optionalPositiveInt = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  });

const optionalPositiveNumber = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  });

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyId: optionalString,
  sector: z.string().min(1, 'Sector is required'),
  subSector: optionalString,
  employeeCount: optionalPositiveInt,
  annualRevenue: optionalPositiveNumber,
  contactName: optionalString,
  contactEmail: optionalEmail,
  contactPhone: optionalString,
  address: optionalString,
});

export const updateClientSchema = createClientSchema.partial();

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sector: z.string().optional(),
  search: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientQuery = z.infer<typeof clientQuerySchema>;
