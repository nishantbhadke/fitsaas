import { FastifyInstance } from 'fastify';
import { prisma } from 'database';

export default async function workoutRoutes(server: FastifyInstance) {
  // Hook to ensure authentication for all routes here
  server.addHook('onRequest', server.authenticate);

  server.get('/', async (request, reply) => {
    const user = (request as any).user;
    const workouts = await prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });
    return { workouts };
  });

  server.post('/', async (request, reply) => {
    const user = (request as any).user;
    const { title, duration, notes } = request.body as any;
    
    if (!title) {
      return reply.status(400).send({ error: 'Title is required' });
    }

    const workout = await prisma.workout.create({
      data: {
        title,
        duration,
        notes,
        userId: user.id,
      },
    });

    return { workout };
  });

  server.get('/:id', async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as any;

    const workout = await prisma.workout.findFirst({
      where: { id, userId: user.id },
      include: { exercises: { include: { sets: true } } },
    });

    if (!workout) {
      return reply.status(404).send({ error: 'Workout not found' });
    }

    return { workout };
  });

  server.delete('/:id', async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as any;

    try {
      await prisma.workout.delete({
        where: { id, userId: user.id },
      });
      return { success: true };
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete workout' });
    }
  });
}
