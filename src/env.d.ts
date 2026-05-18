/// <reference types="astro/client" />

// Globais injetadas pelos snippets de medição (GA4 + Meta Pixel).
// Declaradas como opcionais — todos os usos verificam `typeof === 'function'`
// antes de chamar, então o código nunca quebra se o Pixel ainda não existir.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export {};
