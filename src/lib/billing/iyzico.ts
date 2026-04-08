// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import Iyzipay from 'iyzipay';

let iyzicoInstance: Iyzipay | null = null;

export function getIyzico(): Iyzipay {
  if (!iyzicoInstance) {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const uri = process.env.IYZICO_URI ?? 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      throw new Error('IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlanmamış.');
    }

    iyzicoInstance = new Iyzipay({ apiKey, secretKey, uri });
  }

  return iyzicoInstance;
}

export function iyzicoRequest<T>(
  fn: (iyzico: Iyzipay, callback: (err: unknown, result: T) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const iyzico = getIyzico();
    fn(iyzico, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
