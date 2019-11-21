///////////////////////////////////////////////////////////////////////////////
//Copyright (C) 2019 Joliciel Informatique
//
//This file is part of Jochre.
//
//Jochre is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
//
//Jochre is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.
//
//You should have received a copy of the GNU Affero General Public License
//along with Jochre.  If not, see <http://www.gnu.org/licenses/>.
//////////////////////////////////////////////////////////////////////////////

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
let defaultFontSize = "12.0";

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
  ["ArticleAuthor", "Article author"],
  ["ArticleDate", "Article date"],
  ["TOC", "Internal Table of contents"],
  ["ExternalTOC", "External Table of contents"],
  ["Index", "Index"],
  ["CharacterName", "Character name in play"],
  ["StageDirections", "Stage directions"]
];

let structureTagsGraphicalElements = [
  ["TextSeparator", "Text separator"],
  ["FootnoteSeparator", "Footnote separator"]
];

let structureTagsIllustrations = [
];

let allStructureTags = structureTags.concat(structureTagsGraphicalElements).concat(structureTagsIllustrations);

// Sample text, which will be shown at various font sizes
let sampleText = "Lorem ipsum dolor sit amet";

// Symbol to use for glyphs for which we have no text
let missingGlyph = "�";