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
const axios_1 = __importDefault(require("axios"));
const ExchangeModel_1 = __importDefault(require("../models/ExchangeModel"));
class Exchange {
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
    static fetchLatestRates(baseCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .get(`${Exchange._endpoint}?currency=usd`)
                .then(({ data }) => {
                const $ = cheerio.load(data);
                const $exchangeRates = $('[data-test="dynamic-table"] [class^="datatable_row__"]');
                const latestRates = [];
                const date = new Date();
                $exchangeRates.each((_, exchange) => {
                    const columns = $(exchange).find('td');
                    let pairName = '';
                    let exchangeRate = 0.0;
                    columns.each((index, column) => {
                        // currency pair name
                        if (index === 0) {
                            pairName = Exchange.formatCurrencyPairName($(column).text());
                        }
                        // currency pair bid price
                        if (index === 1) {
                            exchangeRate = Exchange.parseCurrencyPairBidPrice($(column).text());
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
                Exchange._exchangeModel.upsert(rates);
                return rates;
            })
                .catch((err) => {
                throw new Error(err);
            });
        });
    }
    static getRates(baseCurrency = 'USD') {
        return __awaiter(this, void 0, void 0, function* () {
            let rates = yield Exchange._exchangeModel.findByCurrency(baseCurrency);
            if (!rates) {
                rates = yield Exchange.fetchLatestRates(baseCurrency);
            }
            return rates;
        });
    }
    static convert(fromCurrency, fromValue, toCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const { exchangeRates } = yield Exchange.getRates(fromCurrency);
            let exchangeRate = 0;
            exchangeRates.forEach((_exchangeRate) => {
                const key = Object.keys(_exchangeRate)[0];
                if (key === toCurrency)
                    exchangeRate = _exchangeRate[key];
            });
            const convertedValue = fromValue * exchangeRate;
            return +convertedValue.toFixed(2);
        });
    }
}
Exchange._exchangeModel = new ExchangeModel_1.default();
Exchange._endpoint = 'https://br.investing.com/currencies/single-currency-crosses';
exports.default = Exchange;
