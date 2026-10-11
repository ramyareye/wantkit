import {
	detectLocale,
	directionForLocale,
	isLocale,
	message,
	type Locale,
} from "@wantkit/i18n";

export const localeStorageKey = "wantkit.locale";
const legacyLocaleStorageKey = "kharidyar.locale";

export function readStoredLocale(): Locale | null {
	try {
		const value = window.localStorage.getItem(localeStorageKey);
		if (isLocale(value)) return value;
		// Preserve existing language choices; LocaleProvider saves the new key.
		const legacyValue = window.localStorage.getItem(legacyLocaleStorageKey);
		return isLocale(legacyValue) ? legacyValue : null;
	} catch {
		return null;
	}
}

export function applyDocumentLocale(locale: Locale): void {
	const root = document.documentElement;
	root.lang = locale;
	root.dir = directionForLocale(locale);
	document.title = message(locale, "app.name");
}

export function resolveInitialLocale(): Locale {
	const locale = readStoredLocale() ?? detectLocale(window.navigator.languages);
	applyDocumentLocale(locale);
	return locale;
}
