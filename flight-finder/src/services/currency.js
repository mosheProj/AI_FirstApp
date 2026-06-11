const FRANKFURTER_URL = 'https://api.frankfurter.app/latest';

const SYMBOL_MAP = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  ILS: '₪',
  BRL: 'R$',
  MXN: 'MX$',
  KRW: '₩',
  RUB: '₽',
  TRY: '₺',
  PLN: 'zł',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ZAR: 'R',
  AED: 'د.إ',
  SAR: '﷼',
  THB: '฿',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
};

export function getCurrencySymbol(currency) {
  const code = currency?.toUpperCase?.() ?? 'USD';
  return SYMBOL_MAP[code] ?? code;
}

export function formatPrice(amount, currency) {
  const code = currency.toUpperCase();
  const symbol = getCurrencySymbol(code);
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (['USD', 'EUR', 'GBP', 'ILS', 'JPY', 'INR', 'BRL', 'RUB', 'TRY', 'KRW'].includes(code)) {
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${code}`;
}

export async function convertPrices(prices, targetCurrency) {
  const target = targetCurrency.trim().toUpperCase();
  const normalized = prices
    .map((p, index) => ({
      index,
      amount: Number(p.amount),
      currency: p.currency.trim().toUpperCase(),
    }))
    .filter((p) => Number.isFinite(p.amount) && p.amount > 0 && p.currency);

  if (!normalized.length) {
    return { targetCurrency: target, conversions: [], rates: {} };
  }

  const sourceCurrencies = [...new Set(normalized.map((p) => p.currency))].filter(
    (c) => c !== target,
  );

  let rates = { [target]: 1 };

  if (sourceCurrencies.length) {
    const params = new URLSearchParams({
      from: target,
      to: sourceCurrencies.join(','),
    });

    const response = await fetch(`${FRANKFURTER_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Currency conversion failed (${response.status})`);
    }

    const data = await response.json();
    rates = { ...rates, ...(data.rates ?? {}) };
  }

  const conversions = normalized.map((item) => {
    if (item.currency === target) {
      return {
        index: item.index,
        originalAmount: item.amount,
        originalCurrency: item.currency,
        convertedAmount: item.amount,
        targetCurrency: target,
        currencySymbol: getCurrencySymbol(target),
        formattedPrice: formatPrice(item.amount, target),
      };
    }

    const rate = rates[item.currency];
    if (!rate || rate <= 0) {
      return {
        index: item.index,
        originalAmount: item.amount,
        originalCurrency: item.currency,
        convertedAmount: item.amount,
        targetCurrency: item.currency,
        currencySymbol: getCurrencySymbol(item.currency),
        formattedPrice: formatPrice(item.amount, item.currency),
        conversionNote: `Could not convert ${item.currency} to ${target}; kept original currency.`,
      };
    }

    const convertedAmount = Math.round((item.amount / rate) * 100) / 100;
    return {
      index: item.index,
      originalAmount: item.amount,
      originalCurrency: item.currency,
      convertedAmount,
      targetCurrency: target,
      currencySymbol: getCurrencySymbol(target),
      formattedPrice: formatPrice(convertedAmount, target),
      rate,
    };
  });

  return {
    targetCurrency: target,
    conversions,
    rates,
  };
}

export async function applyTargetCurrencyToFlights(flights, targetCurrency) {
  const target = targetCurrency.trim().toUpperCase();
  const prices = flights.map((flight, index) => ({
    index,
    amount: Number(flight.price) || 0,
    currency: (flight.currency || target).trim().toUpperCase(),
  }));

  const { conversions } = await convertPrices(prices, target);
  const byIndex = Object.fromEntries(conversions.map((c) => [c.index, c]));

  return flights.map((flight, index) => {
    const conversion = byIndex[index];
    const updated = {
      ...flight,
      currency: target,
      currencySymbol: getCurrencySymbol(target),
    };

    if (!conversion || conversion.convertedAmount <= 0) {
      return updated;
    }

    return {
      ...updated,
      price: conversion.convertedAmount,
    };
  });
}
