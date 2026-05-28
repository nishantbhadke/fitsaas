import { FastifyInstance } from 'fastify';
import { prisma } from 'database';
import crypto from 'crypto';

export default async function authRoutes(server: FastifyInstance) {
  const serializeUser = (user: any) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    gender: user.gender,
    cycleLength: user.cycleLength,
    lastPeriodStart: user.lastPeriodStart,
    weight: user.weight,
    height: user.height,
    targetWeight: user.targetWeight,
    birthDate: user.birthDate,
    activityLevel: user.activityLevel,
    dailyWaterGoal: user.dailyWaterGoal,
    dailyCalorieGoal: user.dailyCalorieGoal,
  });

  server.post('/register', async (request, reply) => {
    const { email, password, name } = request.body as any;
    
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password, 
          name,
        },
      });

      const token = server.jwt.sign({ id: user.id, email: user.email });
      return { token, user: serializeUser(user) };
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
    return { token, user: serializeUser(user) };
  });

  server.post('/google', async (request, reply) => {
    const { email, name, image } = request.body as any;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required for Google login' });
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await prisma.user.create({
          data: {
            email,
            password: randomPassword,
            name: name || '',
            image: image || null,
          },
        });
      } else if (image && user.image !== image) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { image },
        });
      }

      const token = server.jwt.sign({ id: user.id, email: user.email });
      return { token, user: serializeUser(user) };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Authentication failed' });
    }
  });

  server.get('/me', { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    if (!dbUser) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return { user: serializeUser(dbUser) };
  });

  server.put('/profile', { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { 
      name, 
      gender, 
      cycleLength, 
      lastPeriodStart,
      weight,
      height,
      targetWeight,
      birthDate,
      activityLevel,
      dailyWaterGoal,
      dailyCalorieGoal
    } = request.body as any;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || undefined,
          gender: gender || null,
          cycleLength: gender === "FEMALE" ? (cycleLength ? parseInt(cycleLength) : null) : null,
          lastPeriodStart: gender === "FEMALE" ? (lastPeriodStart ? new Date(lastPeriodStart) : null) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          targetWeight: targetWeight ? parseFloat(targetWeight) : null,
          birthDate: birthDate ? new Date(birthDate) : null,
          activityLevel: activityLevel || null,
          dailyWaterGoal: dailyWaterGoal ? parseInt(dailyWaterGoal) : null,
          dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal) : null,
        },
      });
      return { user: serializeUser(updatedUser) };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to update profile' });
    }
  });
}
