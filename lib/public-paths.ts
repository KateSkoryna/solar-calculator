export const HOW_IT_WORKS_SECTION_ID = "how-it-works";

export function homePath(locale: string) {
  return `/${locale}`;
}

export function howItWorksPath(locale: string) {
  return `${homePath(locale)}#${HOW_IT_WORKS_SECTION_ID}`;
}

export function calculatorPath(locale: string) {
  return `/${locale}/calculator`;
}

export function loginPath(locale: string) {
  return `/${locale}/login`;
}

export function accountPath(locale: string) {
  return `/${locale}/user`;
}

export function privacyPath(locale: string) {
  return `/${locale}/privacy`;
}

export function legalNoticePath(locale: string) {
  return `/${locale}/legal-notice`;
}
