import { IExchangeModel } from '../interfaces';
import { CurrencyRates, Currency, RefreshRatesInverval } from '../types';
declare class ExchangeRedisModel extends IExchangeModel {
    private _client;
    constructor(redisDatabaseURL: string);
    create(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
    findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    update(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
    upsert(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
}
export default ExchangeRedisModel;
