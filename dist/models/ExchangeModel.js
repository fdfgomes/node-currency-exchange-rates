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
const fs_1 = __importDefault(require("fs"));
class ExchangeModel {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { baseCurrency } = data;
            return new Promise((resolve, reject) => {
                fs_1.default.writeFile(`./src/data/${baseCurrency}.json`, JSON.stringify(data), (err) => {
                    if (err)
                        throw reject(err);
                    resolve(data);
                });
            })
                .then((result) => result)
                .catch((err) => {
                // console.log(err);
                return null;
            });
        });
    }
    findByCurrency(baseCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            // quotations are valid for 1 hour
            // after that must refetch rates and update local data
            return new Promise((resolve, reject) => {
                fs_1.default.readFile(`./src/data/${baseCurrency}.json`, (err, data) => {
                    if (err)
                        reject(err);
                    resolve(data ? JSON.parse(data.toString()) : null);
                });
            })
                .then((result) => {
                // validate if local quotations exists and, if so, that they are still valid
                const today = new Date();
                const resultDate = new Date(result.date);
                const resultDay = resultDate.getDate();
                const resultMonth = resultDate.getMonth() + 1;
                const resultYear = resultDate.getFullYear();
                const day = today.getDate();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();
                // quotations are not from today, return null
                if (!(resultDay === day && resultMonth === month && resultYear === year)) {
                    return null;
                }
                const resultsHours = resultDate.getHours();
                const hours = today.getHours();
                // quotations expired, return null
                if (resultsHours !== hours)
                    return null;
                return result;
            })
                .catch((err) => {
                // console.log(err);
                return null;
            });
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(data);
        });
    }
    upsert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(data);
        });
    }
}
exports.default = ExchangeModel;
