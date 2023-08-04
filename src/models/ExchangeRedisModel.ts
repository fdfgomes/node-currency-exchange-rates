import { RedisClientType, createClient } from 'redis';
import { IExchangeModel } from '../interfaces';
import { CurrencyRates, Currency } from '../types';
import moment from 'moment';

class ExchangeRedisModel implements IExchangeModel {
  private _client: RedisClientType;

  constructor(redisDatabaseURL: string) {
    this._client = createClient({
      url: redisDatabaseURL,
    });

    this._client.on('error', (err) => console.log('Redis Client Error', err));
  }

  public async create(data: CurrencyRates): Promise<CurrencyRates | null> {
    try {
      const { baseCurrency } = data;

      if (!this._client.isReady) await this._client.connect();

      await this._client.set(baseCurrency, JSON.stringify(data));

      let now = new Date();

      now.setHours(now.getHours(), 0, 0, 0);

      const expireAt = moment(now).add(1, 'hour').toDate();

      await this._client.expireAt(baseCurrency, expireAt);

      return data;
    } catch (_err) {
      return null;
    }
  }

  public async findByCurrency(
    baseCurrency: Currency
  ): Promise<CurrencyRates | null> {
    try {
      if (!this._client.isReady) await this._client.connect();

      const rates = await this._client.get(baseCurrency);

      let parsedRates: CurrencyRates | null = null;

      try {
        parsedRates = rates ? JSON.parse(rates.toString()) : null;
      } catch (_err) {
        //
      }

      if (parsedRates) {
        const { date } = parsedRates;

        const formattedDate = new Date(date);

        const formattedParsedRates: CurrencyRates = {
          ...parsedRates,
          date: formattedDate,
        };

        return formattedParsedRates;
      }

      throw new Error('Redis quotes are not available or expired');
    } catch (_err) {
      return null;
    }
  }

  public async update(data: CurrencyRates): Promise<CurrencyRates | null> {
    return this.create(data);
  }

  public async upsert(data: CurrencyRates): Promise<CurrencyRates | null> {
    return this.create(data);
  }
}

export default ExchangeRedisModel;
