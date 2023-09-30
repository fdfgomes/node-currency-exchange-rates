import { Currency, CurrencyRates } from '../types';
declare abstract class IExchangeModel {
    protected _generateFileName(baseCurrency: Currency): string;
    abstract create(data: CurrencyRates): Promise<CurrencyRates | null>;
    abstract findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    abstract update(data: CurrencyRates): Promise<CurrencyRates | null>;
    abstract upsert(data: CurrencyRates): Promise<CurrencyRates | null>;
}
export default IExchangeModel;
