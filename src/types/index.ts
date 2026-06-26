export const Tags = {
  Smoke: '@smoke',
  Regression: '@regression',
  Critical: '@critical',
  Mobile: '@mobile',
  Negative: '@negative',
} as const;

export type Tag = (typeof Tags)[keyof typeof Tags];

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserSignup extends UserCredentials {
  name: string;
  title: 'Mr' | 'Mrs';
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: Country;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
  dateOfBirth: { day: string; month: string; year: string };
}

export type Country =
  | 'India'
  | 'United States'
  | 'Canada'
  | 'Australia'
  | 'Israel'
  | 'New Zealand'
  | 'Singapore';

export interface BillingDetails {
  fullName: string;
  address1: string;
  city: string;
  state: string;
  zipcode: string;
  country: Country;
  mobile: string;
}

export interface PaymentDetails {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
