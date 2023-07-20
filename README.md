# node-currency-exchange-rates

Open-source project designed to provide exchange rates and offer a simple currency conversion experience.

# Installation

```js
npm install node-currency-exchange-rates
```

# Methods

### getRates([baseCurrency='USD'])

- Returns exchange rates for given currency.

- Receives one optional parameter:

  - `baseCurrency` - must be a valid currency.

    - <i>Default value is USD.</i>

> <i>\* Valid currencies can be found <a href="https://github.com/fdfgomes/node-currency-exchange-rates/blob/main/src/types/Currency.ts">here</a>.</i>

#### Valid usage examples:

#### **Without** `baseCurrency` optional parameter:

```js
import exchange from 'node-currency-exchange-rates';

const example = async () => {
  const rates = await exchange.getRates();
  console.log(rates);
};

example();
```

#### **With** `baseCurrency` optional parameter:

```js
import exchange from 'node-currency-exchange-rates';

const example = async () => {
  const rates = await exchange.getRates('USD');
  console.log(rates);
};

example();
```

#### Output:

```js
{
  baseCurrency: 'USD',
  baseValue: 1,
  date: '2023-07-20T18:03:15.362Z',
  exchangeRates: [
    { JPY: 140.17 },  { CHF: 0.87 },    { CAD: 1.32 },     { ZAR: 17.93 },
    { TRY: 26.79 },   { MXN: 16.86 },   { PLN: 4 },        { SEK: 10.36 },
    { SGD: 1.33 },    { DKK: 6.7 },     { NOK: 10.08 },    { ILS: 3.61 },
    { HUF: 342.31 },  { CZK: 21.5 },    { THB: 34.02 },    { AED: 3.67 },
    { JOD: 0.71 },    { KWD: 0.31 },    { HKD: 7.81 },     { SAR: 3.75 },
    { INR: 82.01 },   { KRW: 1276.48 }, { ALL: 89.04 },    { AMD: 385.29 },
    { ANG: 1.76 },    { ARS: 268.68 },  { AUD: 1.47 },     { BBD: 1.97 },
    { BDT: 106.09 },  { BGN: 1.75 },    { BHD: 0.37 },     { BND: 1.3 },
    { BOB: 6.75 },    { BRL: 4.81 },    { BSD: 0.99 },     { BWP: 12.91 },
    { BZD: 1.97 },    { CLP: 816.3 },   { CNY: 7.17 },     { COP: 3976.4 },
    { CRC: 524.25 },  { CUP: 23.98 },   { DZD: 134.04 },   { ETB: 54.59 },
    { EUR: 0.9 },     { FJD: 2.19 },    { GBP: 0.78 },     { GEL: 2.54 },
    { GHS: 11 },      { GMD: 59.45 },   { GNF: 8555 },     { GTQ: 7.67 },
    { HNL: 24.55 },   { HTG: 135.06 },  { IDR: 15041.07 }, { IQD: 1283.35 },
    { IRR: 42050 },   { ISK: 131.02 },  { JMD: 152.07 },   { KES: 140.08 },
    { KHR: 4040.97 }, { KMF: 438.06 },  { KZT: 443.08 },   { LAK: 19050 },
    { LBP: 14976.1 }, { LKR: 323.02 },  { LSL: 17.85 },    { LYD: 4.71 },
    { MAD: 9.43 },    { MDL: 17.18 },   { MGA: 4445 },     { MKD: 54.06 },
    { MMK: 2080.06 }, { MOP: 7.87 },    { MRU: 36.08 },    { MUR: 44.03 },
    { MVR: 15.25 },   { MWK: 1050 },    { MYR: 4.54 },     { NAD: 17.85 },
    { NGN: 790.05 },  { NIO: 36.15 },   { NPR: 129.08 },   { NZD: 1.61 },
    { PAB: 0.98 },    { PEN: 3.51 },    { PGK: 3.47 },     { PHP: 54.06 },
    { PKR: 284 },     { PYG: 7161.63 }, { QAR: 3.64 },     { RON: 4.43 },
    { RSD: 104.08 },  { RUB: 90.23 },   { RWF: 1156.04 },  { SCR: 12.97 },
    { SDG: 598 },     { SOS: 566 },     { STN: 21.87 },    { SVC: 8.54 },
    ... 30 more items
  ]
}
```

### convert(fromCurrency, fromValue, toCurrency)

- Returns the converted value using the given currencies.

- Receives **3 required** parameters:

  - `fromCurrency` - valid base currency;
  - `fromValue` - value to be converted;
  - `toCurrency` - valid currency.

> <i>\* Valid currencies can be found <a href="https://github.com/fdfgomes/node-currency-exchange-rates/blob/main/src/types/Currency.ts">here</a>.</i>

#### Valid usage example:

```js
import exchange from 'node-currency-exchange-rates';

const example = async () => {
  // convert 100 USD to EUR
  const convertedValue = await exchange.convert('USD', 100, 'EUR');
  console.log(convertedValue);
};

example();
```

#### Output:

```js
90
```
