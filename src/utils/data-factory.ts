import { faker } from '@faker-js/faker';
import type {
  BillingDetails,
  ContactMessage,
  PaymentDetails,
  UserCredentials,
  UserSignup,
} from '../types/index.js';

const seed = process.env.FAKER_SEED;
if (seed) {
  faker.seed(Number(seed));
}

function pickTitle(): 'Mr' | 'Mrs' {
  return faker.helpers.arrayElement(['Mr', 'Mrs']);
}

export function makeUser(overrides: Partial<UserSignup> = {}): UserSignup {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    title: pickTitle(),
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName, provider: 'qa-demo.test' }).toLowerCase(),
    password: faker.internet.password({ length: 14, memorable: false }),
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: 'United States',
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('#####'),
    mobile: faker.string.numeric(10),
    dateOfBirth: {
      day: String(faker.number.int({ min: 1, max: 28 })),
      month: faker.helpers.arrayElement([
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]),
      year: String(faker.number.int({ min: 1960, max: 2004 })),
    },
    ...overrides,
  };
}

export function makeCredentials(overrides: Partial<UserCredentials> = {}): UserCredentials {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 14 }),
    ...overrides,
  };
}

export function makeBilling(user: UserSignup): BillingDetails {
  return {
    fullName: `${user.firstName} ${user.lastName}`,
    address1: user.address1,
    city: user.city,
    state: user.state,
    zipcode: user.zipcode,
    country: user.country,
    mobile: user.mobile,
  };
}

export function makePayment(user: UserSignup): PaymentDetails {
  return {
    nameOnCard: `${user.firstName} ${user.lastName}`,
    cardNumber: '4111 1111 1111 1111',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: String(new Date().getUTCFullYear() + 3),
  };
}

export function makeContactMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    subject: faker.lorem.sentence({ min: 3, max: 6 }),
    message: faker.lorem.paragraph(),
    ...overrides,
  };
}
