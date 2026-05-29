import { FastifyInstance } from 'fastify';
import { prisma } from 'database';
import crypto from 'crypto';

export default async function authRoutes(server: FastifyInstance) {
  const getGravatar = (email: string) => {
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
  };

  const serializeUser = (user: any) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image || getGravatar(user.email),
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
    dietPlanEnabled: user.dietPlanEnabled,
    dietType: user.dietType,
    isLactoseIntolerant: user.isLactoseIntolerant,
    isGlutenFree: user.isGlutenFree,
    menstrualTrackingEnabled: user.menstrualTrackingEnabled,
  });

  const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  };

  const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash.includes(':')) {
      // Legacy plaintext password check
      return storedHash === password;
    }
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  };

  server.post('/register', async (request, reply) => {
    const { email, password, name } = request.body as any;
    
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(400).send({ error: 'A user with this email already exists.' });
      }

      const hashedPassword = hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword, 
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

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !verifyPassword(password, user.password)) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Auto-upgrade legacy plaintext password to PBKDF2 hash on successful login
    if (!user.password.includes(':')) {
      try {
        const upgradedHash = hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: upgradedHash },
        });
        server.log.info(`Successfully upgraded legacy plaintext password for user: ${email}`);
      } catch (err) {
        server.log.error(err as any, `Failed to upgrade password for legacy user ${email}`);
      }
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
      dailyCalorieGoal,
      dietPlanEnabled,
      dietType,
      isLactoseIntolerant,
      isGlutenFree
    } = request.body as any;

    try {
      // Validate positive bounds (no negative values)
      if (weight !== undefined && weight !== null && parseFloat(weight) < 0) {
        return reply.status(400).send({ error: 'Weight cannot be negative.' });
      }
      if (height !== undefined && height !== null && parseFloat(height) < 0) {
        return reply.status(400).send({ error: 'Height cannot be negative.' });
      }
      if (targetWeight !== undefined && targetWeight !== null && parseFloat(targetWeight) < 0) {
        return reply.status(400).send({ error: 'Target weight cannot be negative.' });
      }
      if (dailyWaterGoal !== undefined && dailyWaterGoal !== null && parseInt(dailyWaterGoal.toString()) < 0) {
        return reply.status(400).send({ error: 'Daily water goal cannot be negative.' });
      }
      if (dailyCalorieGoal !== undefined && dailyCalorieGoal !== null && parseInt(dailyCalorieGoal.toString()) < 0) {
        return reply.status(400).send({ error: 'Daily calorie goal cannot be negative.' });
      }
      if (cycleLength !== undefined && cycleLength !== null && parseInt(cycleLength.toString()) < 0) {
        return reply.status(400).send({ error: 'Cycle length cannot be negative.' });
      }

      // Validate dates
      if (birthDate && new Date(birthDate) > new Date()) {
        return reply.status(400).send({ error: 'Birth date cannot be in the future.' });
      }
      if (lastPeriodStart && new Date(lastPeriodStart) > new Date()) {
        return reply.status(400).send({ error: 'Last period start date cannot be in the future.' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || undefined,
          gender: gender || null,
          cycleLength: gender === "FEMALE" ? (cycleLength ? parseInt(cycleLength.toString()) : null) : null,
          lastPeriodStart: gender === "FEMALE" ? (lastPeriodStart ? new Date(lastPeriodStart) : null) : null,
          weight: weight ? parseFloat(weight.toString()) : null,
          height: height ? parseFloat(height.toString()) : null,
          targetWeight: targetWeight ? parseFloat(targetWeight.toString()) : null,
          birthDate: birthDate ? new Date(birthDate) : null,
          activityLevel: activityLevel || null,
          dailyWaterGoal: dailyWaterGoal ? parseInt(dailyWaterGoal.toString()) : null,
          dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal.toString()) : null,
          dietPlanEnabled: dietPlanEnabled !== undefined ? Boolean(dietPlanEnabled) : undefined,
          dietType: dietType || undefined,
          isLactoseIntolerant: isLactoseIntolerant !== undefined ? Boolean(isLactoseIntolerant) : undefined,
          isGlutenFree: isGlutenFree !== undefined ? Boolean(isGlutenFree) : undefined,
        },
      });
      return { user: serializeUser(updatedUser) };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to update profile' });
    }
  });
}
