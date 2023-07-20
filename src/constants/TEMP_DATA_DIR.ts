import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.ENVIRONMENT ?? 'DEV';

export default process.env[`TEMP_DATA_DIR_${ENV}`] ?? './src/data';
