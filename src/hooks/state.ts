import { state } from '../utils/io';

export const useCounter = state(0, { increment: () => state => state + 1 });
