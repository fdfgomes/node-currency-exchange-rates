import exchange from './entities/Exchange';
import { Currency } from './types';

export const getRates = exchange.getRates;

export const convert = exchange.convert;

export default { getRates, convert };

export type { Currency };
