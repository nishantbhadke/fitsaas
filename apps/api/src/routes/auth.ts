import { FastifyInstance } from 'fastify';
import { prisma } from 'database';
import crypto from 'crypto';

export default async function authRoutes(server: FastifyInstance) {
  server.post('/register', async (request, reply) => {
    const { email, password, name } = request.body as any;
    
    // Minimal validation
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    try {
      // In production, ALWAYS hash passwords (e.g. bcrypt)
      // Keeping it simple here for the prototype as requested.
      const user = await prisma.user.create({
        data: {
          email,
          password, 
          name,
        },
      });

      const token = server.jwt.sign({ id: user.id, email: user.email });
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'User could not be created' });
    }
  });

  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = server.jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  server.post('/google', async (request, reply) => {
    const { email, name } = request.body as any;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required for Google login' });
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create user with a random password since they use Google
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await prisma.user.create({
          data: {
            email,
            password: randomPassword,
            name: name || '',
          },
        });
      }

      const token = server.jwt.sign({ id: user.id, email: user.email });
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Authentication failed' });
    }
  });
}
