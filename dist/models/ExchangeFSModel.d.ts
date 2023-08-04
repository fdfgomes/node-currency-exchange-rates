import { IExchangeModel } from '../interfaces';
import { Currency, CurrencyRates } from '../types';
declare class ExchangeFSModel implements IExchangeModel {
    create(data: CurrencyRates): Promise<CurrencyRates | null>;
    findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    update(data: CurrencyRates): Promise<any>;
    upsert(data: CurrencyRates): Promise<any>;
}
export default ExchangeFSModel;
