import * as cheerio from 'cheerio';
import axios from 'axios';
import { Currency, CurrencyRates, ExchangeRate } from '../types';
import ExchangeModel from '../models/ExchangeModel';

class Exchange {
  private static _exchangeModel = new ExchangeModel();

  private static _endpoint = `https://br.investing.com/currencies/single-currency-crosses`;

  private static formatCurrencyPairName(pairName: string) {
    return pairName.replace(/Dólar/gi, 'USD');
  }

  private static formatCurrencyPairBidPrice(bidPrice: string) {
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
      parsedBidPriceDecimals = Math.round(parseInt(strPriceDecimals) / 100);
    }

    parsedBidPrice += parsedBidPriceInteger;
    parsedBidPrice += parsedBidPriceDecimals / 100;

    return Number(parsedBidPrice.toFixed(2));
  }

  private static async fetchLatestRates(
    baseCurrency: Currency
  ): Promise<CurrencyRates> {
    return axios
      .get(`${Exchange._endpoint}?currency=${baseCurrency.toLowerCase()}`)
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
              exchangeRate = Exchange.formatCurrencyPairBidPrice(
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
            return base === baseCurrency;
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

        Exchange._exchangeModel.upsert(rates);

        return rates;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  public static async getRates(
    baseCurrency: Currency = 'USD'
  ): Promise<CurrencyRates> {
    let rates = await Exchange._exchangeModel.findByCurrency(baseCurrency);

    if (!rates) {
      rates = await this.fetchLatestRates(baseCurrency);
    }

    return rates;
  }

  public static async convert(
    fromCurrency: Currency,
    fromValue: number,
    toCurrency: Currency
  ) {
    const { exchangeRates } = await Exchange.getRates(fromCurrency);

    let exchangeRate = 0;

    exchangeRates.forEach((_exchangeRate) => {
      const key = Object.keys(_exchangeRate)[0];
      if (key === toCurrency) exchangeRate = _exchangeRate[key];
    });

    return fromValue * exchangeRate;
  }
}

export default Exchange;
