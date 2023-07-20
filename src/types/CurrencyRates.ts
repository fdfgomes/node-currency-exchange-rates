import Currency from './Currency';

type CurrencyRates = {
  baseCurrency: Currency;
  baseValue: number;
  date: Date;
  exchangeRates: {
    [x: string]: number;
  }[];
};

export default CurrencyRates;
