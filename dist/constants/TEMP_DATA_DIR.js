"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ENV = (_a = process.env.ENVIRONMENT) !== null && _a !== void 0 ? _a : 'DEV';
exports.default = (_b = process.env[`TEMP_DATA_DIR_${ENV}`]) !== null && _b !== void 0 ? _b : './src/data';
