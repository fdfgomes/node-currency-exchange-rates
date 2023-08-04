import Exchange from './entities/Exchange';
import { Currency } from './types';
export declare const getRates: (baseCurrency?: Currency) => Promise<import("./types/CurrencyRates").default>;
export declare const convert: (fromCurrency: Currency, fromValue: number, toCurrency: Currency) => Promise<number>;
declare const _default: {
    getRates: (baseCurrency?: Currency | undefined) => Promise<import("./types/CurrencyRates").default>;
    convert: (fromCurrency: Currency, fromValue: number, toCurrency: Currency) => Promise<number>;
};
export default _default;
export { Exchange };
export type { Currency };
