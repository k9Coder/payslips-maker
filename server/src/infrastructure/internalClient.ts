import axios from 'axios';
import { env } from './env';

export const internalClient = axios.create({
  baseURL: `http://localhost:${env.PORT}`,
  headers: {
    'X-Internal-Secret': env.INTERNAL_API_SECRET,
  },
});
