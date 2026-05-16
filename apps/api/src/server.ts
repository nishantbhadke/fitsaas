import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { prisma } from 'database';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}

dotenv.config();

const server = Fastify({
  logger: true,
});

// Plugins
server.register(cors, {
  origin: '*', // Configure as needed for production
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

// Decorate request with user auth checking
server.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';

// Basic Route
server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Test Database Connection
server.get('/db-test', async (request, reply) => {
  const users = await prisma.user.findMany();
  return { users };
});

// Register custom routes
server.register(authRoutes, { prefix: '/auth' });
server.register(workoutRoutes, { prefix: '/workouts' });

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:3001`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
