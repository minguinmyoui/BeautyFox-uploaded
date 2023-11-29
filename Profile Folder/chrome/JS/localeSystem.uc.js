// ==UserScript==
// @name			Locale System
// @description 	Locale system for Firefox themes dependent on userChrome.js.
// @author			AngelBruni
// ==/UserScript==

var IsIE9PreReleaseAppearance = false;
try {
    IsIE9PreReleaseAppearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE9PreRelease");
} catch (error) {
    console.error("Error retrieving IE9 Pre-Release Appearance preference:", error);
}

var IsIE10DeveloperPreviewAppearance = false;
try {
    IsIE10DeveloperPreviewAppearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE10DeveloperPreview");
} catch (error) {
    console.error("Error retrieving IE10DeveloperPreview Appearance preference:", error);
}

var IsIE10ConsumerPreviewAppearance = false;
try {
    IsIE10ConsumerPreviewAppearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE10ConsumerPreview");
} catch (error) {
    console.error("Error retrieving IE10ConsumerPreview Appearance preference:", error);
}

var IsIE10ReleasePreviewAppearance = false;
try {
    IsIE10ReleasePreviewAppearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE10ReleasePreview");
} catch (error) {
    console.error("Error retrieving IE10ReleasePreview Appearance preference:", error);
}

var IsIE10Appearance = false;
try {
    IsIE10Appearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE10");
} catch (error) {
    console.error("Error retrieving IE10 Appearance preference:", error);
}

var IsIE11Appearance = false;
try {
    IsIE11Appearance = Services.prefs.getBoolPref("BeautyFox.appearance.IE11");
} catch (error) {
    console.error("Error retrieving IE11 Appearance preference:", error);
}

var translations = {}; // Object to store translations

// Load translations asynchronously based on user's language
function loadTranslations(lang, region) {
    return fetch(`chrome://userchrome/content/locales/${lang}/${region}.json`)
        .then(response => response.json())
        .then(data => {
            if (!translations[lang]) {
                translations[lang] = {};
            }
            translations[lang][region] = data;
        })
        .catch(error => {
            console.error(`Error loading translations for chrome://userchrome/content/locales/${lang}/${region}.json:`, error);
        });
}

// Load translations for user's language and fallback to 'en' for missing keys
function loadLocale() {
    const userLanguage = (navigator.language || navigator.userLanguage).split('-');
    const lang = userLanguage[0];
    const region = userLanguage[1];

    // Load translations for user's language and region
    return loadTranslations(lang, region)
        .then(() => {
            // If translations for the user's language and region are not available, load 'fallback.json'
            if (!translations[lang] || !translations[lang][region]) {
                console.warn(`Translations not available for chrome://userchrome/content/locales/${lang}/${region}.json.`);

                // Now load 'fallback.json' for missing keys
                return loadTranslations(lang, 'fallback');
            }
        })
        .then(() => {
            // Call loadLocale inside the promise to ensure translations are loaded before processing
            applyTranslations();
        });
}

// Apply translations to the document
function applyTranslations() {
    const userLanguage = navigator.language || navigator.userLanguage;
    const elements = document.querySelectorAll('[locale]');

    elements.forEach(element => {
        const key = element.getAttribute('locale');
        let text = "";

        const lang = userLanguage.split('-')[0];
        const region = userLanguage.split('-')[1];

        // Use specific language and region translation if available
        if (translations[lang] && translations[lang][region] && translations[lang][region][key]) {
            text = translations[lang][region][key];
        }
        // Use language fallback if available
        else if (translations[lang] && translations[lang]['fallback'] && translations[lang]['fallback'][key]) {
            text = translations[lang]['fallback'][key];
        }
        // Fallback to English if no translation is found
        // Check if translations for 'en' are available, otherwise use a placeholder or the key itself
        else if (translations['en'] && translations['en']['fallback'] && translations['en']['fallback'][key]) {
            text = translations['en']['fallback'][key];
        } else {
            text = `${key}`;
        }

        // Replace the placeholder with the actual version
        const beautyFoxVersion = '%beautyFoxVersion';
        text = text.replace(new RegExp(beautyFoxVersion, 'g'), 'Beta 4.5');
        
        const IEVersion = '%IEVersion';
        if (IsIE11Appearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '11');
        }
        else if (IsIE10Appearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '10');
        }
        else if (IsIE10ReleasePreviewAppearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '10 Release Preview');
        }
        else if (IsIE10ConsumerPreviewAppearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '10 Consumer Preview');
        }
        else if (IsIE10DeveloperPreviewAppearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '10 Developer Preview');
        }
        else if (IsIE9PreReleaseAppearance) {
            text = text.replace(new RegExp(IEVersion, 'g'), '9 Pre-Release');
        }
        else {
            text = text.replace(new RegExp(IEVersion, 'g'), '9');
        }

        if (element.tagName.toLowerCase() === 'window') {
            // Set localized string to title attribute for these elements
            element.setAttribute('title', text);
        } else if ( element.tagName.toLowerCase() === 'checkbox' ||
                    element.tagName.toLowerCase() === 'menuitem' ||
                    element.tagName.toLowerCase() === 'toolbarbutton' ||
                    element.tagName.toLowerCase() === 'menuitem' ||
                    element.tagName.toLowerCase() === 'menu') {
            // Set localized string to label attribute for these elements
            element.setAttribute('label', text);
        } else {
            // Set localized string to textContent for other elements
            element.textContent = text;
        }
    });
}

loadLocale();