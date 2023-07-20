import { Currency, CurrencyRates } from '../types';
declare class Exchange {
    private static _exchangeModel;
    private static _endpoint;
    private static formatCurrencyPairName;
    private static formatCurrencyPairBidPrice;
    private static fetchLatestRates;
    static getRates(baseCurrency?: Currency): Promise<CurrencyRates>;
    static convert(fromCurrency: Currency, fromValue: number, toCurrency: Currency): Promise<number>;
}
export default Exchange;
