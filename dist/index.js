"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchange = exports.convert = exports.getRates = void 0;
const Exchange_1 = __importDefault(require("./entities/Exchange"));
exports.Exchange = Exchange_1.default;
const exchange = new Exchange_1.default();
const getRates = (baseCurrency) => exchange.getRates(baseCurrency);
exports.getRates = getRates;
const convert = (fromCurrency, fromValue, toCurrency) => exchange.convert(fromCurrency, fromValue, toCurrency);
exports.convert = convert;
exports.default = { getRates: exports.getRates, convert: exports.convert };
