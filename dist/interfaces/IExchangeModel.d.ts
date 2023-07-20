import { Currency, CurrencyRates } from '../types';
interface IExchangeModel {
    create(data: CurrencyRates): Promise<CurrencyRates | null>;
    findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    update(data: CurrencyRates): Promise<CurrencyRates | null>;
    upsert(data: CurrencyRates): Promise<CurrencyRates | null>;
}
export default IExchangeModel;
