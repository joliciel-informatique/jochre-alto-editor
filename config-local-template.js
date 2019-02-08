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