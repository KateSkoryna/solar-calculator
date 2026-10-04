import englishMessages from "./en.json";
import germanMessages from "./de.json";
import spanishMessages from "./es.json";

type MessageTree = { [key: string]: string | MessageTree };

const REFERENCE_LOCALE = "en";

const MESSAGES_BY_LOCALE: Record<string, MessageTree> = {
  en: englishMessages,
  de: germanMessages,
  es: spanishMessages,
};

function flattenMessages(
  messages: MessageTree,
  parentPath = "",
): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>(
    (flattened, [key, value]) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      return typeof value === "string"
        ? { ...flattened, [path]: value }
        : { ...flattened, ...flattenMessages(value, path) };
    },
    {},
  );
}

const referenceKeys = Object.keys(
  flattenMessages(MESSAGES_BY_LOCALE[REFERENCE_LOCALE]),
).sort();

describe("translation messages", () => {
  it.each(Object.keys(MESSAGES_BY_LOCALE))(
    "%s has the same keys as the reference locale",
    (locale) => {
      const localeKeys = Object.keys(
        flattenMessages(MESSAGES_BY_LOCALE[locale]),
      ).sort();

      expect(localeKeys).toEqual(referenceKeys);
    },
  );

  it.each(Object.keys(MESSAGES_BY_LOCALE))(
    "%s has no empty value",
    (locale) => {
      const emptyKeys = Object.entries(
        flattenMessages(MESSAGES_BY_LOCALE[locale]),
      )
        .filter(([, value]) => value.trim() === "")
        .map(([key]) => key);

      expect(emptyKeys).toEqual([]);
    },
  );
});
