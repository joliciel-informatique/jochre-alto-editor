// The default language for pages
let defaultLanguage = "ji";

// Accents are assumed to be contained in a single glyph with the preceding character
let accents = new Set(["ֱ", "ֲ", "ֳ", "ִ", "ֵ", "ֶ", "ַ", "ָ", "ֻ", "ּ", "ֽ", "ֿ", "ׁ", "ׂ", "ׄ", "ְ", "ֹ"]);

// This is the list that will always be available to the user
// It will be completed with any additional font families found in the Alto file styles.
let initialFontFamilies = [
  ["Latin Serif", {fontType: "serif", fontWidth: "proportional"}],
  ["Latin Sans Serif", {fontType: "sans-serif", fontWidth: "proportional"}],
  ["Latin Typewriter", {fontType: "serif", fontWidth: "fixed"}],
];

// The font family selected by default for all page elements.
let defaultFontFamily = "Latin Serif";

// This is the list that will always be available to the user
// It will be completed with any additional font sizes found in the Alto file styles.
let initialFontSizes = [
  ["9.0", "9pt"],
  ["12.0", "12pt"],
  ["14.0", "14pt"],
  ["18.0", "18pt"],
  ["24.0", "24pt"],
];

// The font size selected by default for all page elements.
let defaultFontSize = "12pt";

// The list of available layout tags
let layoutTags = [
  ["Masterhead", "Masterhead"],
  ["Table", "Table"],
  ["TransitionSep", "Transition separator"],
  ["FootnoteSep", "Footnote separator"],
  ["DropCap", "DropCap"],
  ["Illegible", "Illegible"],
  ["Noise", "Noise"],
];

// The list of available structure tags
let structureTags = [
  ["RunningTitle", "Running title"],
  ["PageNumber", "Page number"],
  ["FullTitle", "Full title"],
  ["Title1", "Title 1"],
  ["Title2", "Title 2"],
  ["Footnote", "Footnote"],
  ["Catchword", "Catchword"],
  ["Marginalia", "Marginalia"],
  ["FigureCaption", "Figure caption"],
  ["TableCaption", "Table caption"],
];

// Sample text, which will be shown at various font sizes
let sampleText = "Lorem ipsum dolor sit amet";

// Symbol to use for glyphs for which we have no text
let missingGlyph = "�";