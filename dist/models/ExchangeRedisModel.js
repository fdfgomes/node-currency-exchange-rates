"use strict";
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
const redis_1 = require("redis");
const interfaces_1 = require("../interfaces");
const moment_1 = __importDefault(require("moment"));
class ExchangeRedisModel extends interfaces_1.IExchangeModel {
    constructor(redisDatabaseURL) {
        super();
        this._client = (0, redis_1.createClient)({
            url: redisDatabaseURL,
        });
        this._client.on('error', (err) => console.log('Redis Client Error', err));
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { baseCurrency } = data;
                if (!this._client.isReady)
                    yield this._client.connect();
                let now = new Date();
                now.setHours(now.getHours(), 0, 0, 0);
                const key = this._generateFileName(baseCurrency);
                yield this._client.set(key, JSON.stringify(data));
                const expireAt = (0, moment_1.default)(now).add(1, 'hour').toDate();
                yield this._client.expireAt(key, expireAt);
                return data;
            }
            catch (_err) {
                return null;
            }
        });
    }
    findByCurrency(baseCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._client.isReady)
                    yield this._client.connect();
                const key = this._generateFileName(baseCurrency);
                const rates = yield this._client.get(key);
                let parsedRates = null;
                try {
                    parsedRates = rates ? JSON.parse(rates.toString()) : null;
                }
                catch (_err) {
                    //
                }
                if (parsedRates) {
                    const { date } = parsedRates;
                    const formattedDate = new Date(date);
                    const formattedParsedRates = Object.assign(Object.assign({}, parsedRates), { date: formattedDate });
                    return formattedParsedRates;
                }
                throw new Error('Redis quotes are not available or expired');
            }
            catch (_err) {
                return null;
            }
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create(data);
        });
    }
    upsert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create(data);
        });
    }
}
exports.default = ExchangeRedisModel;
