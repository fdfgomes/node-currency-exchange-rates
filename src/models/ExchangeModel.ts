import { TEMP_DATA_DIR } from '../constants';
import { IExchangeModel } from '../interfaces';
import { Currency, CurrencyRates } from '../types';
import fs from 'fs';

type IUnformattedCurrencyRates = {
  baseCurrency: Currency;
  baseValue: number;
  date: string;
  exchangeRates: {
    [x: string]: number;
  }[];
};

class ExchangeModel implements IExchangeModel {
  public async create(data: CurrencyRates) {
    const { baseCurrency } = data;

    return new Promise<CurrencyRates>((resolve, reject) => {
      fs.writeFile(
        `${TEMP_DATA_DIR}/${baseCurrency}.json`,
        JSON.stringify(data),
        (err) => {
          if (err) throw reject(err);
          resolve(data);
        }
      );
    })
      .then((result) => result)
      .catch((err) => {
        // console.log(err);
        return null;
      });
  }

  public async findByCurrency(
    baseCurrency: Currency
  ): Promise<CurrencyRates | null> {
    // quotations are valid for 1 hour
    // after that must refetch rates and update local data
    return new Promise<CurrencyRates>((resolve, reject) => {
      fs.readFile(`${TEMP_DATA_DIR}/${baseCurrency}.json`, (err, data) => {
        if (err) reject(err);

        const parsedData: IUnformattedCurrencyRates = data
          ? JSON.parse(data.toString())
          : null;

        if (parsedData) {
          const { date } = parsedData;

          const formattedDate = new Date(date);

          const formattedParsedData: CurrencyRates = {
            ...parsedData,
            date: formattedDate,
          };

          return resolve(formattedParsedData);
        }

        resolve(parsedData);
      });
    })
      .then((result) => {
        // validate if local quotations exists and, if so, if they are still valid
        const today = new Date();
        const resultDate = new Date(result.date);

        const resultDay = resultDate.getDate();
        const resultMonth = resultDate.getMonth() + 1;
        const resultYear = resultDate.getFullYear();

        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        // quotations are not from today, return null
        if (
          !(resultDay === day && resultMonth === month && resultYear === year)
        ) {
          return null;
        }

        const resultsHours = resultDate.getHours();

        const hours = today.getHours();

        // quotations expired, return null
        if (resultsHours !== hours) return null;

        return result;
      })
      .catch((err) => {
        // console.log(err);
        return null;
      });
  }

  public async update(data: CurrencyRates): Promise<any> {
    return await this.create(data);
  }

  public async upsert(data: CurrencyRates): Promise<any> {
    return await this.create(data);
  }
}

export default ExchangeModel;
