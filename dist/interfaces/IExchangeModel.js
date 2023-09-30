"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IExchangeModel {
    _generateFileName(baseCurrency) {
        return `exchange_rates_${baseCurrency}`;
    }
}
exports.default = IExchangeModel;
