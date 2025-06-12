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
const constants_1 = require("../constants");
const interfaces_1 = require("../interfaces");
const fs_1 = __importDefault(require("fs"));
class ExchangeFSModel extends interfaces_1.IExchangeModel {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { baseCurrency } = data;
            return new Promise((resolve, reject) => {
                if (!fs_1.default.existsSync(constants_1.TEMP_DATA_DIR)) {
                    fs_1.default.mkdirSync(constants_1.TEMP_DATA_DIR, { recursive: true });
                }
                const fileName = this._generateFileName(baseCurrency);
                fs_1.default.writeFile(`${constants_1.TEMP_DATA_DIR}/${fileName}.json`, JSON.stringify(data), (err) => {
                    if (err)
                        throw reject(err);
                    resolve(data);
                });
            })
                .then((result) => result)
                .catch((_err) => {
                // console.log(err);
                return null;
            });
        });
    }
    findByCurrency(baseCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const fileName = this._generateFileName(baseCurrency);
                fs_1.default.readFile(`${constants_1.TEMP_DATA_DIR}/${fileName}.json`, (err, data) => {
                    if (err)
                        reject(err);
                    let parsedData = null;
                    try {
                        parsedData = data ? JSON.parse(data.toString()) : null;
                    }
                    catch (_err) {
                        // skip error
                    }
                    if (parsedData) {
                        const { date } = parsedData;
                        const formattedDate = new Date(date);
                        const formattedParsedData = Object.assign(Object.assign({}, parsedData), { date: formattedDate });
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
exports.default = ExchangeFSModel;
