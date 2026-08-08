import api from './axios'


// ==============================
// RECEIPTS
// ==============================

export const getReceipts = async (params) => {
  const { data } = await api.get("/receipt", { params });
  return data;
};

/**
 * KPI summary: totalToday, totalThisWeek, totalThisMonth,
 * totalRefunds, netReceipts.
 */
export const getReceiptStatsSummary = async () => {
  const { data } = await api.get("/receipt/stats/summary");
  return data;
};

/**
 * Area chart data — revenue received per day.
 * @param {number} [days=8] Number of trailing days to include
 */
export const getReceiptRevenueTrend = async (days = 8) => {
  const { data } = await api.get("/receipt/stats/revenue-trend", {
    params: { days },
  });
  return data;
};

/**
 * Pie chart data — payment method share of transactions.
 * ⚠️ Blocked until payment method is tracked in the schema (see note below).
 * @param {{ from?: string, to?: string }} [range] ISO date strings
 */
export const getReceiptPaymentTypeSplit = async (range = {}) => {
  const { from, to } = range;
  const { data } = await api.get("/receipt/stats/payment-type-split", {
    params: { from, to },
  });
  return data;
};

/**
 * Bar chart data — bookings closed per tour.
 * @param {{ from?: string, to?: string }} [range] ISO date strings
 */
export const getReceiptBookingsPerTour = async (range = {}) => {
  const { from, to } = range;
  const { data } = await api.get("/receipt/stats/bookings-per-tour", {
    params: { from, to },
  });
  return data;
};