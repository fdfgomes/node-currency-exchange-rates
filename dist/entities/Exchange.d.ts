import { Currency, CurrencyRates, RefreshRatesInverval } from '../types';
declare class Exchange {
    private _exchangeModel;
    private static _endpoint;
    private _refreshRatesInterval;
    constructor(redisDatabaseURL?: string);
    private static _formatCurrencyPairName;
    private static _parseCurrencyPairBidPrice;
    private _fetchLatestRates;
    getRates(baseCurrency?: Currency): Promise<CurrencyRates>;
    convert(fromCurrency: Currency, fromValue: number, toCurrency: Currency): Promise<number>;
    set refreshRatesInterval(refreshRatesInterval: RefreshRatesInverval);
    get refreshRatesInterval(): RefreshRatesInverval;
}
export default Exchange;
