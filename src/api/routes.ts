import { Router } from 'express';
import { activityRouter } from './activities/routes';

export const appRoutes = Router().use('/api',activityRouter)