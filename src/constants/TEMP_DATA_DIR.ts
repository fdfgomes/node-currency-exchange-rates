require('dotenv').config();

const ENVIRONMENT = process.env.ENVIRONMENT ?? 'PRD';

const TEMP_DATA_DIR_DEV = './src/.temp';

const TEMP_DATA_DIR_PRD =
  './node_modules/node-currency-exchange-rates/dist/.temp';

let TEMP_DATA_DIR = TEMP_DATA_DIR_DEV;

if (ENVIRONMENT === 'PRD') {
  TEMP_DATA_DIR = TEMP_DATA_DIR_PRD;
}

export default TEMP_DATA_DIR;
