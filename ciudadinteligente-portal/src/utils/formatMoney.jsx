export const formatMoney = (value = 0, currency = 'COP', decimals = 0) => {
  const calcDecimals = currency === 'USD' ? 2 : decimals;

  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: calcDecimals,
    maximumFractionDigits: calcDecimals
  });
};

export const parseMoney = (value = '') => {
  if (!value) return 0;
  return Number(
    value.toString().replace(/[^0-9.]/g, '')
  );
};