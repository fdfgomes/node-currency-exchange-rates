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
  date: 2023-07-22T21:41:40.446Z,
  exchangeRates: [
    { JPY: 141.81 },
    { CHF: 0.8659 },
    { CAD: 1.3222 },
    { ZAR: 17.948 },
    { TRY: 26.9381 },
    { MXN: 16.976 },
    { PLN: 4.0075 },
    { SEK: 10.3821 },
    { SGD: 1.3305 },
    { DKK: 6.6964 },
    { NOK: 10.066 },
    { ILS: 3.6276 },
    { HUF: 340.46 },
    { CZK: 21.5381 },
    { THB: 34.0055 },
    { AED: 3.6719 },
    { KWD: 0.3066 },
    ...
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
89.88
```
