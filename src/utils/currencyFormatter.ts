export const formatCurrencyToWords = (amount: number | string | undefined | null): string => {
  if (!amount) return '';
  const num = Number(amount);
  if (isNaN(num) || num === 0) return '';

  if (num >= 10000000) {
    const crores = num / 10000000;
    return `Rs. ${crores % 1 !== 0 ? crores.toFixed(2).replace(/\.00$/, '') : crores} Crore`;
  } else if (num >= 100000) {
    const lakhs = num / 100000;
    return `Rs. ${lakhs % 1 !== 0 ? lakhs.toFixed(2).replace(/\.00$/, '') : lakhs} Lakh`;
  } else if (num >= 1000) {
    const thousands = num / 1000;
    return `Rs. ${thousands % 1 !== 0 ? thousands.toFixed(2).replace(/\.00$/, '') : thousands} Thousand`;
  } else {
    return `Rs. ${num}`;
  }
};
