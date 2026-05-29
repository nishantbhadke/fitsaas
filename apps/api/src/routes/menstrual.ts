import { FastifyInstance } from 'fastify';
import { prisma } from 'database';

export default async function menstrualRoutes(server: FastifyInstance) {
  // Hook to ensure authentication for all routes here
  server.addHook('onRequest', server.authenticate);

  // GET /menstrual - Fetch all logs for the authenticated user
  server.get('/', async (request, reply) => {
    const user = (request as any).user;
    try {
      const logs = await prisma.menstrualLog.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' },
      });
      return { logs };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch menstrual logs' });
    }
  });

  // POST /menstrual - Add a new log
  server.post('/', async (request, reply) => {
    const user = (request as any).user;
    const { startDate, endDate, symptoms, mood, energy, notes } = request.body as any;

    if (!startDate) {
      return reply.status(400).send({ error: 'Start date is required' });
    }

    try {
      // Validate date bounds
      const parsedStart = new Date(startDate);
      if (isNaN(parsedStart.getTime())) {
        return reply.status(400).send({ error: 'Invalid start date format' });
      }
      if (parsedStart > new Date()) {
        return reply.status(400).send({ error: 'Start date cannot be in the future.' });
      }

      let parsedEnd = null;
      if (endDate) {
        parsedEnd = new Date(endDate);
        if (isNaN(parsedEnd.getTime())) {
          return reply.status(400).send({ error: 'Invalid end date format' });
        }
        if (parsedEnd > new Date()) {
          return reply.status(400).send({ error: 'End date cannot be in the future.' });
        }
        if (parsedEnd < parsedStart) {
          return reply.status(400).send({ error: 'End date cannot be before start date.' });
        }
      }

      const parsedEnergy = energy !== undefined && energy !== null ? parseInt(energy.toString()) : null;
      if (parsedEnergy !== null && (parsedEnergy < 1 || parsedEnergy > 5)) {
        return reply.status(400).send({ error: 'Energy must be a scale of 1 to 5' });
      }

      const log = await prisma.menstrualLog.create({
        data: {
          startDate: parsedStart,
          endDate: parsedEnd,
          symptoms: Array.isArray(symptoms) ? symptoms : [],
          mood: mood || null,
          energy: parsedEnergy,
          notes: notes || null,
          userId: user.id,
        },
      });

      // Symmetrically sync user profile's lastPeriodStart if it is newer
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser && (!dbUser.lastPeriodStart || parsedStart > dbUser.lastPeriodStart)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastPeriodStart: parsedStart },
        });
      }

      return { log };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to log menstrual cycle' });
    }
  });

  // PUT /menstrual/:id - Update specific log
  server.put('/:id', async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as any;
    const { startDate, endDate, symptoms, mood, energy, notes } = request.body as any;

    try {
      const existingLog = await prisma.menstrualLog.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingLog) {
        return reply.status(404).send({ error: 'Log not found' });
      }

      let parsedStart = existingLog.startDate;
      if (startDate) {
        parsedStart = new Date(startDate);
        if (isNaN(parsedStart.getTime())) {
          return reply.status(400).send({ error: 'Invalid start date format' });
        }
        if (parsedStart > new Date()) {
          return reply.status(400).send({ error: 'Start date cannot be in the future.' });
        }
      }

      let parsedEnd = existingLog.endDate;
      if (endDate !== undefined) {
        if (endDate === null) {
          parsedEnd = null;
        } else {
          parsedEnd = new Date(endDate);
          if (isNaN(parsedEnd.getTime())) {
            return reply.status(400).send({ error: 'Invalid end date format' });
          }
          if (parsedEnd > new Date()) {
            return reply.status(400).send({ error: 'End date cannot be in the future.' });
          }
          if (parsedEnd < parsedStart) {
            return reply.status(400).send({ error: 'End date cannot be before start date.' });
          }
        }
      }

      let parsedEnergy = existingLog.energy;
      if (energy !== undefined) {
        parsedEnergy = energy !== null ? parseInt(energy.toString()) : null;
        if (parsedEnergy !== null && (parsedEnergy < 1 || parsedEnergy > 5)) {
          return reply.status(400).send({ error: 'Energy must be a scale of 1 to 5' });
        }
      }

      const updatedLog = await prisma.menstrualLog.update({
        where: { id, userId: user.id },
        data: {
          startDate: parsedStart,
          endDate: parsedEnd,
          symptoms: symptoms !== undefined && Array.isArray(symptoms) ? symptoms : undefined,
          mood: mood !== undefined ? mood : undefined,
          energy: parsedEnergy,
          notes: notes !== undefined ? notes : undefined,
        },
      });

      // Symmetrically update user's lastPeriodStart if the newest log was updated
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser && updatedLog.startDate && (!dbUser.lastPeriodStart || updatedLog.startDate > dbUser.lastPeriodStart)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastPeriodStart: updatedLog.startDate },
        });
      }

      return { log: updatedLog };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to update menstrual log' });
    }
  });

  // DELETE /menstrual/:id - Delete log
  server.delete('/:id', async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as any;

    try {
      const existingLog = await prisma.menstrualLog.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingLog) {
        return reply.status(404).send({ error: 'Log not found' });
      }

      await prisma.menstrualLog.delete({
        where: { id, userId: user.id },
      });

      // After delete, recheck the newest log to sync lastPeriodStart on User
      const newestLog = await prisma.menstrualLog.findFirst({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastPeriodStart: newestLog ? newestLog.startDate : null },
      });

      return { success: true };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete menstrual log' });
    }
  });

  // POST /menstrual/toggle - Toggle menstrual tracking on/off
  server.post('/toggle', async (request, reply) => {
    const user = (request as any).user;
    const { enabled } = request.body as any;

    if (enabled === undefined) {
      return reply.status(400).send({ error: 'Enabled status is required' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { menstrualTrackingEnabled: Boolean(enabled) },
      });
      return { enabled: updatedUser.menstrualTrackingEnabled };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to toggle tracking' });
    }
  });
}
