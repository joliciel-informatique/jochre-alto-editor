// copy this file and rename it config-local.js

function config() {
  // override config settings from config.js here
  // Here is an example for Yiddish

  // The default language for pages
  defaultLanguage = "ji";

  // Accents are assumed to be contained in a single glyph with the preceding character
  accents = new Set(["ֱ", "ֲ", "ֳ", "ִ", "ֵ", "ֶ", "ַ", "ָ", "ֻ", "ּ", "ֽ", "ֿ", "ׁ", "ׂ", "ׄ", "ְ", "ֹ"]);

  // This is the list that will always be available to the user
  // It will be completed with any additional font families found in the Alto file styles.
  initialFontFamilies = [
    ["Hebrew Serif", {fontType: "serif", fontWidth: "proportional"}],
    ["Hebrew Sans Serif", {fontType: "sans-serif", fontWidth: "proportional"}],
    ["Hebrew Typewriter", {fontType: "serif", fontWidth: "fixed"}],
    ["Latin Serif", {fontType: "serif", fontWidth: "proportional"}],
    ["Latin Sans Serif", {fontType: "sans-serif", fontWidth: "proportional"}],
    ["Latin Typewriter", {fontType: "serif", fontWidth: "fixed"}],
    ["Cyrillic Serif", {fontType: "serif", fontWidth: "proportional"}],
    ["Cyrillic Sans Serif", {fontType: "sans-serif", fontWidth: "proportional"}],
    ["Cyrillic Typewriter", {fontType: "serif", fontWidth: "fixed"}],
  ];

  // The font family selected by default for all page elements.
  defaultFontFamily = "Hebrew Serif";

  // Sample text, which will be shown at various font sizes
  sampleText = "דאָס ייִדישע פאָלק";
}