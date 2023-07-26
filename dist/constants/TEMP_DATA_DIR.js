"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const ENVIRONMENT = (_a = process.env.ENVIRONMENT) !== null && _a !== void 0 ? _a : 'PRD';
const TEMP_DATA_DIR_DEV = './src/.temp';
const TEMP_DATA_DIR_PRD = './node_modules/node-currency-exchange-rates/dist/.temp';
let TEMP_DATA_DIR = TEMP_DATA_DIR_DEV;
if (ENVIRONMENT === 'PRD') {
    TEMP_DATA_DIR = TEMP_DATA_DIR_PRD;
}
exports.default = TEMP_DATA_DIR;
