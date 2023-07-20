import exchange from './index';

const example = async () => {
  const rates = await exchange.getRates('USD');

  const conversion = await exchange.convert('USD', 100, 'EUR');

  console.log(rates);

  console.log(conversion);
};

example();
