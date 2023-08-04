import Exchange from './entities/Exchange';
import { Currency } from './types';

const exchange = new Exchange();

export const getRates = (baseCurrency?: Currency) =>
  exchange.getRates(baseCurrency);

export const convert = (
  fromCurrency: Currency,
  fromValue: number,
  toCurrency: Currency
) => exchange.convert(fromCurrency, fromValue, toCurrency);

export default { getRates, convert };

export { Exchange };

export type { Currency };
