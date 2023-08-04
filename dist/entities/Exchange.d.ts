import { Currency, CurrencyRates } from '../types';
declare class Exchange {
    private _exchangeModel;
    private static _endpoint;
    constructor(redisDatabaseURL?: string);
    private static formatCurrencyPairName;
    private static parseCurrencyPairBidPrice;
    private fetchLatestRates;
    getRates(baseCurrency?: Currency): Promise<CurrencyRates>;
    convert(fromCurrency: Currency, fromValue: number, toCurrency: Currency): Promise<number>;
}
export default Exchange;
