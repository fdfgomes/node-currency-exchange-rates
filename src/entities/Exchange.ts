import * as cheerio from 'cheerio';
import {
  Currency,
  CurrencyRates,
  ExchangeRate,
  RefreshRatesInverval,
} from '../types';
import { ExchangeFSModel, ExchangeRedisModel } from '../models';
import { IExchangeModel } from '../interfaces';
import { differenceInHours } from 'date-fns';
import puppeteer from 'puppeteer';

class Exchange {
  private _exchangeModel: IExchangeModel;

  private static _endpoint =
    'https://br.investing.com/currencies/single-currency-crosses';

  private _refreshRatesInterval: RefreshRatesInverval = '1h';

  constructor(redisDatabaseURL = '') {
    if (redisDatabaseURL) {
      this._exchangeModel = new ExchangeRedisModel(redisDatabaseURL);
    } else {
      this._exchangeModel = new ExchangeFSModel();
    }
  }

  private static _formatCurrencyPairName(pairName: string) {
    return pairName.replace(/Dólar/gi, 'USD');
  }

  private static _parseCurrencyPairBidPrice(bidPrice: string) {
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

  private async _fetchLatestRates(
    baseCurrency: Currency
  ): Promise<CurrencyRates> {
    try {
      // Launch the browser and open a new blank page
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // Navigate the page to a URL
      await page.goto(`${Exchange._endpoint}?currency=usd`, {
        waitUntil: 'domcontentloaded',
      });

      // Wait for exchange rates table
      const $exchangeRatesTable = await page.waitForSelector(
        'table[class^="datatable-v2_table"]'
      );

      const data = await page.content();

      if (!$exchangeRatesTable || !data) {
        throw new Error('Failed to retrieve exchange rates');
      }

      const $ = cheerio.load(data);

      const $exchangeRates = $(
        'table[class^="datatable-v2_table"] tr[class^="datatable-v2_row"]'
      );

      const latestRates: ExchangeRate[] = [];

      const date = new Date();

      $exchangeRates.each((_, exchange) => {
        const columns = $(exchange).find('td[class^=datatable-v2_cell]');

        let pairName: string = '';
        let exchangeRate: any = 0.0;

        columns.each((index, column) => {
          // currency pair name
          if (index === 1) {
            pairName = Exchange._formatCurrencyPairName(
              $(column).text()
            ).trim();
          }
          // currency pair bid price
          if (index === 2) {
            exchangeRate = Exchange._parseCurrencyPairBidPrice(
              $(column).text()
            );
          }
        });

        // skip table's heading line
        if (pairName) {
          latestRates.push({ pair: pairName, exchange: exchangeRate });
        }
      });

      // console.log({ latestRates });

      const exchangeRates = latestRates
        .filter(({ pair }) => {
          const base = pair.split('/')[0];
          return base === 'USD';
        })
        .map(({ pair, exchange }) => {
          const currency = pair.split('/')[1].trim();

          return {
            [currency]: exchange,
          };
        });

      // console.log({ exchangeRates });

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

      // console.log(rates);

      this._exchangeModel.upsert(rates, this._refreshRatesInterval);

      await browser.close();

      return rates;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public async getRates(
    baseCurrency: Currency = 'USD'
  ): Promise<CurrencyRates> {
    const cachedRates = await this._exchangeModel.findByCurrency(baseCurrency);

    if (cachedRates) {
      let refreshRatesIntervalInHours = 1;

      switch (this.refreshRatesInterval) {
        case '6h':
          refreshRatesIntervalInHours = 6;
          break;
        case '12h':
          refreshRatesIntervalInHours = 12;
          break;
        case '24h':
          refreshRatesIntervalInHours = 24;
          break;
        default:
          break;
      }

      const diff = differenceInHours(cachedRates.date, new Date());

      if (diff <= refreshRatesIntervalInHours) {
        return cachedRates;
      }
    }

    try {
      const rates = await this._fetchLatestRates(baseCurrency);
      return rates;
    } catch (_err) {
      if (cachedRates) return cachedRates;
    }

    throw new Error(
      'Failed to retrieve updated exchange rates... Please try again in a few seconds'
    );
  }

  public async convert(
    fromCurrency: Currency,
    fromValue: number,
    toCurrency: Currency
  ) {
    if (fromCurrency === toCurrency) return fromValue;

    let exchangeRate = 0;

    // fulfill exchangeRate
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { exchangeRates } = await this.getRates(fromCurrency);

      exchangeRates.forEach((_exchangeRate) => {
        const key = Object.keys(_exchangeRate)[0];
        if (key === toCurrency) exchangeRate = _exchangeRate[key];
      });

      if (exchangeRate > 0) break;

      await this._fetchLatestRates(fromCurrency);
    }

    const convertedValue = fromValue * exchangeRate;

    return +convertedValue.toFixed(2);
  }

  set refreshRatesInterval(refreshRatesInterval: RefreshRatesInverval) {
    this._refreshRatesInterval = refreshRatesInterval;
  }

  get refreshRatesInterval() {
    return this._refreshRatesInterval;
  }
}

export default Exchange;
