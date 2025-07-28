export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'digital_wallet', label: 'Digital Wallet' }
] as const;

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'verified', label: 'Verified' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'rejected', label: 'Rejected' }
] as const;

export const PAYMENT_TYPES = [
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' }
] as const;