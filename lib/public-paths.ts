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

export const RESULTS_ANSWERS_PARAMETER = "answers";

export function resultsPath(locale: string, encodedAnswers: string) {
  return `/${locale}/results?${RESULTS_ANSWERS_PARAMETER}=${encodedAnswers}`;
}

export function registerPath(locale: string) {
  return `/${locale}/register`;
}

export function checkEmailPath(locale: string) {
  return `/${locale}/check-email`;
}
