import { z } from 'zod';

const username = z.string().min(6, 'username must be at least 6 characters');
const password = z.string().min(6, 'password must be at least 6 characters');
const email = z.string().email('email is invalid');

export const loginSchema = z.object({
  role: z.enum(['admin', 'user']),
  username,
  password,
});

// avatar is a file id; null removes it
const avatarId = z.number().int().positive().nullable();

export const createUserSchema = z.object({ username, password, email, avatarId: avatarId.optional() });

export const updateUserSchema = z
  .object({ username, password, email, avatarId })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'at least one field is required');

// admins have no avatar
export const createAdminSchema = z.object({ username, password, email });
export const updateAdminSchema = z
  .object({ username, password, email })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'at least one field is required');

const blogSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug may contain lowercase letters, digits and single dashes only')
  .max(150);

export const createBlogSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  slug: blogSlug.optional(),
  detail: z.string().max(200000).optional().default(''),
  category: z.string().trim().min(1).max(100).optional().default('General'),
  draft: z.boolean().optional().default(true),
  coverId: avatarId.optional(),
});

export const updateBlogSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug: blogSlug,
    detail: z.string().max(200000),
    category: z.string().trim().min(1).max(100),
    draft: z.boolean(),
    coverId: avatarId,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'at least one field is required');

const fileName = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/, 'name may contain letters, digits, _ and - only');
// detail holds rich text (HTML), so allow long values
const fileDetail = z.string().max(50000);

export const uploadFileSchema = z.object({
  name: fileName,
  detail: fileDetail.optional().default(''),
});

export const updateFileSchema = z.object({
  name: fileName.optional(),
  detail: fileDetail.optional(),
});
