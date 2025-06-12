import { TEMP_DATA_DIR } from '../constants';
import { IExchangeModel } from '../interfaces';
import { Currency, CurrencyRates } from '../types';
import fs from 'fs';

class ExchangeFSModel extends IExchangeModel {
  public async create(data: CurrencyRates) {
    const { baseCurrency } = data;

    return new Promise<CurrencyRates>((resolve, reject) => {
      if (!fs.existsSync(TEMP_DATA_DIR)) {
        fs.mkdirSync(TEMP_DATA_DIR, { recursive: true });
      }

      const fileName = this._generateFileName(baseCurrency);

      fs.writeFile(
        `${TEMP_DATA_DIR}/${fileName}.json`,
        JSON.stringify(data),
        (err) => {
          if (err) throw reject(err);
          resolve(data);
        }
      );
    })
      .then((result) => result)
      .catch((_err) => {
        // console.log(err);
        return null;
      });
  }

  public async findByCurrency(
    baseCurrency: Currency
  ): Promise<CurrencyRates | null> {
    return new Promise<CurrencyRates>((resolve, reject) => {
      const fileName = this._generateFileName(baseCurrency);

      fs.readFile(`${TEMP_DATA_DIR}/${fileName}.json`, (err, data) => {
        if (err) reject(err);

        let parsedData: CurrencyRates | null = null;

        try {
          parsedData = data ? JSON.parse(data.toString()) : null;
        } catch (_err) {
          // skip error
        }

        if (parsedData) {
          const { date } = parsedData;

          const formattedDate = new Date(date);

          const formattedParsedData: CurrencyRates = {
            ...parsedData,
            date: formattedDate,
          };

          return resolve(formattedParsedData);
        }

        reject('Local quotes are not available');
      });
    })
      .then((result) => result)
      .catch((_err) => {
        // console.log(err);
        return null;
      });
  }

  public async update(data: CurrencyRates): Promise<any> {
    return this.create(data);
  }

  public async upsert(data: CurrencyRates): Promise<any> {
    return this.create(data);
  }
}

export default ExchangeFSModel;
