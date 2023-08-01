import Currency from './Currency';

type CurrencyRates = {
  baseCurrency: Currency;
  baseValue: number;
  date: Date;
  exchangeRates: {
    [key: string]: number;
  }[];
};

export default CurrencyRates;
