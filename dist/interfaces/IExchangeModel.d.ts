import { Currency, CurrencyRates, RefreshRatesInverval } from '../types';
declare abstract class IExchangeModel {
    protected _generateFileName(baseCurrency: Currency): string;
    abstract create(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
    abstract findByCurrency(baseCurrency: Currency): Promise<CurrencyRates | null>;
    abstract update(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
    abstract upsert(data: CurrencyRates, expiresIn?: RefreshRatesInverval): Promise<CurrencyRates | null>;
}
export default IExchangeModel;
