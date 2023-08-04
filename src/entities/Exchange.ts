import * as cheerio from 'cheerio';
import axios from 'axios';
import { Currency, CurrencyRates, ExchangeRate } from '../types';
import { ExchangeFSModel, ExchangeRedisModel } from '../models';
import { IExchangeModel } from '../interfaces';

class Exchange {
  private _exchangeModel: IExchangeModel;

  private static _endpoint =
    'https://br.investing.com/currencies/single-currency-crosses';

  constructor(redisDatabaseURL: string = '') {
    if (redisDatabaseURL) {
      this._exchangeModel = new ExchangeRedisModel(redisDatabaseURL);
    } else {
      this._exchangeModel = new ExchangeFSModel();
    }
  }

  private static formatCurrencyPairName(pairName: string) {
    return pairName.replace(/Dólar/gi, 'USD');
  }

  private static parseCurrencyPairBidPrice(bidPrice: string) {
    const strBidPrice = bidPrice
      .replace(/[.,]/g, (match) => (match === '.' ? ',' : '.'))
      .replace(/[,]/g, '');

    const strPriceDecimals = strBidPrice.split('.')[1];

    let parsedBidPrice: number = 0;

    const parsedBidPriceInteger = parseInt(strBidPrice.split('.')[0]);
    let parsedBidPriceDecimals = 0;

    if (strPriceDecimals.length <= 2) {
      parsedBidPriceDecimals = parseInt(strPriceDecimals);
    }

    if (strPriceDecimals.length > 2) {
      parsedBidPriceDecimals = parseInt(strPriceDecimals) / 100;
    }

    parsedBidPrice += parsedBidPriceInteger;
    parsedBidPrice += parsedBidPriceDecimals / 100;

    return parsedBidPrice;
  }

  private async fetchLatestRates(
    baseCurrency: Currency
  ): Promise<CurrencyRates> {
    return axios
      .get(`${Exchange._endpoint}?currency=usd`)
      .then(({ data }) => {
        const $ = cheerio.load(data);

        const $exchangeRates = $(
          '[data-test="dynamic-table"] [class^="datatable_row__"]'
        );

        const latestRates: ExchangeRate[] = [];

        const date = new Date();

        $exchangeRates.each((_, exchange) => {
          const columns = $(exchange).find('td');

          let pairName: string = '';
          let exchangeRate: any = 0.0;

          columns.each((index, column) => {
            // currency pair name
            if (index === 0) {
              pairName = Exchange.formatCurrencyPairName($(column).text());
            }
            // currency pair bid price
            if (index === 1) {
              exchangeRate = Exchange.parseCurrencyPairBidPrice(
                $(column).text()
              );
            }
          });

          // skip table's heading line
          if (pairName) {
            latestRates.push({ pair: pairName, exchange: exchangeRate });
          }
        });

        const exchangeRates = latestRates
          .filter(({ pair }) => {
            const base = pair.split('/')[0];
            return base === 'USD';
          })
          .map(({ pair, exchange }) => {
            const currency = pair.split('/')[1];
            return {
              [currency]: exchange,
            };
          });

        const rates = {
          baseCurrency,
          baseValue: 1,
          date,
          exchangeRates,
        };

        if (baseCurrency !== 'USD') {
          // convert baseValue to USD
          let baseCurrencyExchangeRateAgainstUSD = 0;

          exchangeRates.forEach((_exchangeRate) => {
            const key = Object.keys(_exchangeRate)[0];
            if (key === baseCurrency) {
              baseCurrencyExchangeRateAgainstUSD = _exchangeRate[key];
            }
          });

          const baseValueInUSD = 1 / baseCurrencyExchangeRateAgainstUSD;

          // generate exchange rates for requested currency using baseValue in USD
          rates.exchangeRates = [{ USD: 1 }, ...rates.exchangeRates]
            .map((_exchangeRate) => {
              const key = Object.keys(_exchangeRate)[0];
              const value = _exchangeRate[key];
              return { [key]: baseValueInUSD * value };
            })
            .filter((_exchangeRate) => {
              const key = Object.keys(_exchangeRate)[0];
              return key !== baseCurrency;
            });
        }

        // filter exchange rates before returning'em
        const exchangeRatesCurrencies: string[] = [];

        rates.exchangeRates.forEach((_exchangeRate) => {
          const key = Object.keys(_exchangeRate)[0];
          exchangeRatesCurrencies.push(key);
        });

        rates.exchangeRates = rates.exchangeRates
          // return only valid currency pairs
          .filter((_exchangeRate) => {
            const key = Object.keys(_exchangeRate)[0];
            return key.length === 3;
          })
          // prevent duplicated currency pairs
          .filter((_exchangeRate, index) => {
            const key = Object.keys(_exchangeRate)[0];
            return exchangeRatesCurrencies.indexOf(key) === index;
          });

        this._exchangeModel.upsert(rates);

        return rates;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  public async getRates(
    baseCurrency: Currency = 'USD'
  ): Promise<CurrencyRates> {
    let rates = await this._exchangeModel.findByCurrency(baseCurrency);

    if (!rates) {
      rates = await this.fetchLatestRates(baseCurrency);
    }

    return rates;
  }

  public async convert(
    fromCurrency: Currency,
    fromValue: number,
    toCurrency: Currency
  ) {
    let exchangeRate = 0;

    // fulfill exchangeRate
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { exchangeRates } = await this.getRates(fromCurrency);

      exchangeRates.forEach((_exchangeRate) => {
        const key = Object.keys(_exchangeRate)[0];
        if (key === toCurrency) exchangeRate = _exchangeRate[key];
      });

      if (exchangeRate > 0) break;

      await this.fetchLatestRates(fromCurrency);
    }

    const convertedValue = fromValue * exchangeRate;

    return +convertedValue.toFixed(2);
  }
}

export default Exchange;
