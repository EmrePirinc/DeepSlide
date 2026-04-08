// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

declare module 'iyzipay' {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface IyzipayCallback<T = Record<string, unknown>> {
    (err: unknown, result: T): void;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);

    checkoutFormInitialize: {
      create(request: Record<string, unknown>, callback: IyzipayCallback): void;
    };

    checkoutForm: {
      retrieve(request: Record<string, unknown>, callback: IyzipayCallback): void;
    };

    subscriptionCheckoutForm: {
      initialize(request: Record<string, unknown>, callback: IyzipayCallback): void;
    };

    subscription: {
      cancel(request: Record<string, unknown>, callback: IyzipayCallback): void;
    };

    static LOCALE: {
      TR: string;
      EN: string;
    };

    static CURRENCY: {
      TRY: string;
      EUR: string;
      USD: string;
      GBP: string;
    };

    static PAYMENT_GROUP: {
      PRODUCT: string;
      LISTING: string;
      SUBSCRIPTION: string;
    };

    static BASKET_ITEM_TYPE: {
      PHYSICAL: string;
      VIRTUAL: string;
    };
  }

  export = Iyzipay;
}
