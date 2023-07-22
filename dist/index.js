"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.getRates = void 0;
const Exchange_1 = __importDefault(require("./entities/Exchange"));
exports.getRates = Exchange_1.default.getRates;
exports.convert = Exchange_1.default.convert;
exports.default = { getRates: exports.getRates, convert: exports.convert };
