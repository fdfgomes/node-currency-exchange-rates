import { Currency, CurrencyRates } from '../types';

abstract class IExchangeModel {
  protected _generateFileName(baseCurrency: Currency) {
    return `exchange_rates_${baseCurrency}`;
  }

  public abstract create(data: CurrencyRates): Promise<CurrencyRates | null>;

  public abstract findByCurrency(
    baseCurrency: Currency
  ): Promise<CurrencyRates | null>;

  public abstract update(data: CurrencyRates): Promise<CurrencyRates | null>;

  public abstract upsert(data: CurrencyRates): Promise<CurrencyRates | null>;
}

export default IExchangeModel;
