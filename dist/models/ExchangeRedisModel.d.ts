import { IExchangeModel } from '../interfaces';
import { CurrencyRates, Currency } from '../types';
declare class ExchangeRedisModel extends IExchangeModel {
    private _client;
    constructor(redisDatabaseURL: string);
    create(data: CurrencyRates): Promise<CurrencyRates | null>;
    findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    update(data: CurrencyRates): Promise<CurrencyRates | null>;
    upsert(data: CurrencyRates): Promise<CurrencyRates | null>;
}
export default ExchangeRedisModel;
