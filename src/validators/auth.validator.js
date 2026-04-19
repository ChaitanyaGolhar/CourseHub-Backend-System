const z = require('zod');

const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.object({}),
  query: z.object({})
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  signupSchema,
  loginSchema
};