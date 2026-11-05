import { getRequestConfig } from "next-intl/server";

/**
 * Loads the single-locale (en) message catalog for next-intl.
 */
export default getRequestConfig(async () => {
  return {
    locale: "en",
    messages: (await import("../../messages/en.json")).default,
  };
});
