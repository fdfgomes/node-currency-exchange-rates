"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const models_1 = require("../models");
const puppeteer_1 = __importDefault(require("puppeteer"));
class Exchange {
    constructor(redisDatabaseURL = '') {
        if (redisDatabaseURL) {
            this._exchangeModel = new models_1.ExchangeRedisModel(redisDatabaseURL);
        }
        else {
            this._exchangeModel = new models_1.ExchangeFSModel();
        }
    }
    static formatCurrencyPairName(pairName) {
        return pairName.replace(/Dólar/gi, 'USD');
    }
    static parseCurrencyPairBidPrice(bidPrice) {
        const strBidPrice = bidPrice
            .replace(/[.,]/g, (match) => (match === '.' ? ',' : '.'))
            .replace(/[,]/g, '');
        const strPriceDecimals = strBidPrice.split('.')[1];
        let parsedBidPrice = 0;
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
    fetchLatestRates(baseCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Launch the browser and open a new blank page
                const browser = yield puppeteer_1.default.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = yield browser.newPage();
                // Navigate the page to a URL
                yield page.goto(`${Exchange._endpoint}?currency=usd`, {
                    waitUntil: 'domcontentloaded',
                });
                // Wait for exchange rates table
                const $exchangeRatesTable = yield page.waitForSelector('table[class^="datatable-v2_table"]');
                const data = yield page.content();
                if (!$exchangeRatesTable || !data) {
                    throw new Error('Failed to retrieve exchange rates');
                }
                const $ = cheerio.load(data);
                const $exchangeRates = $('table[class^="datatable-v2_table"] tr[class^="datatable-v2_row"]');
                const latestRates = [];
                const date = new Date();
                $exchangeRates.each((_, exchange) => {
                    const columns = $(exchange).find('td[class^=datatable-v2_cell]');
                    let pairName = '';
                    let exchangeRate = 0.0;
                    columns.each((index, column) => {
                        // currency pair name
                        if (index === 1) {
                            pairName = Exchange.formatCurrencyPairName($(column).text()).trim();
                        }
                        // currency pair bid price
                        if (index === 2) {
                            exchangeRate = Exchange.parseCurrencyPairBidPrice($(column).text());
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
                const exchangeRatesCurrencies = [];
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
                // console.log({ rates });
                // console.log(rates);
                this._exchangeModel.upsert(rates);
                yield browser.close();
                return rates;
            }
            catch (err) {
                throw new Error(err);
            }
        });
    }
    getRates(baseCurrency = 'USD') {
        return __awaiter(this, void 0, void 0, function* () {
            let rates = yield this._exchangeModel.findByCurrency(baseCurrency);
            if (!rates) {
                rates = yield this.fetchLatestRates(baseCurrency);
            }
            return rates;
        });
    }
    convert(fromCurrency, fromValue, toCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fromCurrency === toCurrency)
                return fromValue;
            let exchangeRate = 0;
            // fulfill exchangeRate
            for (let attempt = 0; attempt < 5; attempt += 1) {
                const { exchangeRates } = yield this.getRates(fromCurrency);
                exchangeRates.forEach((_exchangeRate) => {
                    const key = Object.keys(_exchangeRate)[0];
                    if (key === toCurrency)
                        exchangeRate = _exchangeRate[key];
                });
                if (exchangeRate > 0)
                    break;
                yield this.fetchLatestRates(fromCurrency);
            }
            const convertedValue = fromValue * exchangeRate;
            return +convertedValue.toFixed(2);
        });
    }
}
Exchange._endpoint = 'https://br.investing.com/currencies/single-currency-crosses';
exports.default = Exchange;
