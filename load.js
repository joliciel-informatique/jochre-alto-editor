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

// ===========================================================
// Functions for managing the inital load.
// ===========================================================
let altoXml;
let pageElement;
let pdfUrl;

$( document ).ready(function() {
  let text = `<?xml version="1.0" encoding="UTF-8"?>
    <alto xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.loc.gov/standards/alto/ns-v4#"
      xsi:schemaLocation="http://www.loc.gov/standards/alto/ns-v4# http://www.loc.gov/standards/alto/v4/alto-4-0.xsd"
      xmlns:xlink="http://www.w3.org/1999/xlink">
    </alto>`;
  let parser = new DOMParser();
  altoXml = parser.parseFromString(text, "text/xml");

  let altoElement = altoXml.documentElement;
  let nameSpaceURI = altoElement.namespaceURI;
  let layoutElement = altoXml.createElementNS(nameSpaceURI, "Layout");
  altoElement.appendChild(layoutElement);

  pageElement = altoXml.createElementNS(nameSpaceURI, "Page");
  pageElement.setAttribute("ID", `Page`);
  pageElement.setAttribute("HEIGHT", `1500`);
  pageElement.setAttribute("WIDTH", `1000`);
  pageElement.setAttribute("PHYSICAL_IMG_NR", `1`);
  layoutElement.appendChild(pageElement);
});

/**
* Open an image file selected by the user
* and load it to the canvas provided,
* adjusting zoom factor appropriately.
*/
let openImageFile = function(e, canvas) {
  let reader = new FileReader();
  reader.onload = function (event) {
    let imgObj = new Image();
    imgObj.src = event.target.result;
    imgObj.onload = function () {
      imageOnLoad(imgObj);
    };
  };

  reader.readAsDataURL(e.target.files[0]);
}

let openPDFFile = function(event) {
  let reader = new FileReader();
  reader.onload = function (event) {
    pdfUrl = event.target.result;
    pdfjsLib.getDocument(pdfUrl).then(function (doc) {
      let numPages = doc.numPages;
      $('#pdfPage').find('option').remove().end();

      let options = '';
      let count = 0;
      for(let i = 1; i <= numPages; i++) {
        options += `<option value="${i}">${i}</option>`;
      }

      $('#pdfPage').append(options);
    });
  };
  reader.readAsDataURL(event.target.files[0]);
}

function loadPDF() {
  let pageNumber = Number($('#pdfPage').val());
  pdfjsLib.getDocument(pdfUrl).then(function (doc) {
    doc.getPage(pageNumber).then(function (page) {
      let pageImage;
      page.getOperatorList().then(function (ops) {
        let objs = [];
        for (let i=0; i < ops.fnArray.length; i++) {
          if (ops.fnArray[i] == pdfjsLib.OPS.paintJpegXObject || ops.fnArray[i] == pdfjsLib.OPS.paintImageXObject) {
              objs.push(ops.argsArray[i][0])
          }
        }
        pageImage = page.objs.get(objs[0]);
        console.log(`image found`);

        let viewport = page.getViewport(1.0);
        viewport = page.getViewport(pageImage.height / viewport.height);
        let tempCanvas = document.createElement('canvas');
        let context = tempCanvas.getContext('2d');
        tempCanvas.height = viewport.height;
        tempCanvas.width = viewport.width;

        let renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext).then(function(){
          let imgObj = new Image();
          let dataUrl = tempCanvas.toDataURL()
          imgObj.src = dataUrl;
          $("#exportImage").attr("href", "data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=image.png;" + dataUrl.substring("data:image/png;".length));
          imgObj.onload = function () {
            imageOnLoad(imgObj);
          };
        });
      });
    });
  })
}

function imageOnLoad(imgObj) {
  let image = new fabric.Image(imgObj);

  pageElement.setAttribute("ID", `Page`);
  pageElement.setAttribute("HEIGHT", `${image.height}`);
  pageElement.setAttribute("WIDTH", `${image.width}`);
  pageElement.setAttribute("PHYSICAL_IMG_NR", `1`);

  console.log("Setting image");
  canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
  canvas.widthNoZoom = canvas.width;
  let newZoom = canvas.width / image.width;
  let imageRatio = image.height / image.width;
  canvas.setHeight(canvas.width * imageRatio);
  canvas.heightNoZoom = canvas.height;
  canvas.originalZoom = newZoom;
  zoomBackground(canvas, newZoom);
  let slider = document.getElementById("slider");
  slider.value = newZoom * 100;
  zoom = newZoom;
  $("#zoom").html(`${slider.value}%`);
  zoomFonts(zoom);
  console.log("Image set");
}

let openAltoFile = function(event) {
  let input = event.target;

  let reader = new FileReader();
  reader.onload = function () {
    console.log("Got text file")
    let text = reader.result;

    let parser = new DOMParser();
    altoXml = parser.parseFromString(text, "text/xml");
    readAlto();
  };
  reader.readAsText(input.files[0]);
};

// ===========================================================
// Functions for displaying the Alto on the canvas
// ===========================================================

/**
* Parameters:
* - xml: the parsed xml document
* - canvas: a fabric.js canvas
* - pageNumber: the PHYSICAL_IMG_NR to read out of the Alto XML.
*      If null, will read the first page.
*/
function readAlto() {
  console.log(`altoXml: ${altoXml.length}`);
  let pages = altoXml.getElementsByTagName("Page");

  $('#altoPage').find('option').remove().end();

  let options = '';
  let count = 0;
  console.log("Page count: %d", pages.length)
  for(let i = 0; i < pages.length; i++) {
    console.log("page %d: %s", i, pages[i].getAttribute("PHYSICAL_IMG_NR"));
    let physicalPageNumber = pages[i].getAttribute("PHYSICAL_IMG_NR");
    options += `<option value="${physicalPageNumber}">${physicalPageNumber}</option>`;
    count++;
  }

  $('#altoPage').append(options);
  if (count==1) {
    loadAlto();
  }
  zoomFonts(zoom);
}

function loadAlto() {
  canvas.remove(...canvas.getObjects().concat());
  page = {
    name: "page",
    id: "page",
    composedBlocks: [],
    textBlocks: [],
    illustrations: [],
    language: "",
    fontFamily: defaultFontFamily,
  };

  fontFamilyMap = {};
  fontFamilies = [];
  for (let i=0;i<initialFontFamilies.length;i++){
    fontFamilyMap[initialFontFamilies[i][0]] = initialFontFamilies[i][1]
    fontFamilies.push(initialFontFamilies[i][0]);
  }

  fontSizeMap = {};
  fontSizes = [];
  for (let i=0;i<initialFontSizes.length;i++){
    fontSizeMap[initialFontSizes[i][0]] = initialFontSizes[i][1];
    fontSizes.push(initialFontSizes[i]);
  }

  selected = page;
  cbCounter = 1;
  tbCounter = 1;
  tlCounter = 1;
  sCounter = 1;
  gCounter = 1;
  ilCounter = 1;

  let pageNumber = $('#altoPage').val();
  let pages = altoXml.getElementsByTagName("Page");
  for(let i = 0; i < pages.length; i++) {
    let physicalPageNumber = pages[i].getAttribute("PHYSICAL_IMG_NR");
    if (physicalPageNumber===pageNumber) {
      pageElement = pages[i];
      break;
    }
  }

  let textStyleTags = altoXml.getElementsByTagName("TextStyle");
  let styles = {};
  for (let j=0; j<textStyleTags.length; j++) {
    let textStyleTag = textStyleTags[j];
    let id = textStyleTag.getAttribute("id");
    let style = {};
    let fontFamily = {};
    if (textStyleTag.hasAttribute("FONTSIZE"))
      style.fontSize = textStyleTag.getAttribute("FONTSIZE");
    if (textStyleTag.hasAttribute("FONTFAMILY"))
      style.fontFamily = textStyleTag.getAttribute("FONTFAMILY");
    if (textStyleTag.hasAttribute("FONTTYPE")) {
      style.fontType = textStyleTag.getAttribute("FONTTYPE");
      fontFamily.fontType = style.fontType;
    }
    if (textStyleTag.hasAttribute("FONTWIDTH")) {
      style.fontWidth = textStyleTag.getAttribute("FONTWIDTH");
      fontFamily.fontWidth = style.fontWidth;
    }
    if (textStyleTag.hasAttribute("FONTSTYLE")) {
      style.fontStyle = textStyleTag.getAttribute("FONTSTYLE");
      fontFamily.fontStyle = style.fontStyle;
    }
    styles[id] = style;

    if (style.fontFamily!=null) {
      if (fontFamilyMap[style.fontFamily]==null) {
        fontFamilyMap[style.fontFamily] = fontFamily;
        fontFamilies.push(style.fontFamily);
      }
    }

    if (style.fontSize!=null) {
      let fontSize = Number(style.fontSize).toFixed(1);
      if (fontSizeMap[fontSize]==null) {
        fontSizeMap[fontSize] = fontSize;
        fontSizes.push([fontSize, fontSize]);
      }
    }
  }

  loadDropDowns();

  let composedBlockTags = pageElement.getElementsByTagName("ComposedBlock");
  let textBlockTags = pageElement.getElementsByTagName("TextBlock");
  let illustrationTags = pageElement.getElementsByTagName("Illustration");

  let firstTextBlock = textBlockTags[0];
  let altoRotation = parseFloat(firstTextBlock.getAttribute("ROTATION"));
  console.log(`Rotate by ${altoRotation}`);
  rotation = 0.0;
  rotateImage(altoRotation);

  for (let j = 0; j < composedBlockTags.length; j++) {
    let composedBlockTag = composedBlockTags[j];
    this.loadAltoComposedBlock(composedBlockTag, styles);
  }

  illustrationTags = Array.prototype.slice.call(illustrationTags);
  illustrationTags = illustrationTags.filter(function(v, j){
    let parentTag = v.parentElement.tagName;
    return parentTag !== "ComposedBlock"; 
  });
  for (let j = 0; j < illustrationTags.length; j++) {
    let illustrationTag = illustrationTags[j];
    this.loadAltoIllustration(illustrationTag);
  }

  textBlockTags = Array.prototype.slice.call(textBlockTags);
  textBlockTags = textBlockTags.filter(function(v, j){
    let parentTag = v.parentElement.tagName;
    return parentTag !== "ComposedBlock"; 
  });
  for (let j = 0; j < textBlockTags.length; j++) {
    let textBlockTag = textBlockTags[j];
    this.loadAltoTextBlock(textBlockTag, styles, page);
  }


  resizeComposedBlocks();

  sortComposedBlocks();
  sortTextBlocks(page);

  // since certain attributes are missing at page level, we need to find the "majority" attribute.
  let langCounts = {};
  let fontFamilyCounts = {};
  for (let j=0; j<page.textBlocks.length; j++) {
    let textBlock = page.textBlocks[j];
    let lang = getInheritedAttribute(textBlock, "language");
    if (langCounts[lang]) {
      langCounts[lang] += 1;
    } else {
      langCounts[lang] = 1;
    }
    let fontFamily = getInheritedAttribute(textBlock, "fontFamily");
    if (fontFamilyCounts[fontFamily]) {
      fontFamilyCounts[fontFamily] += 1;
    } else {
      fontFamilyCounts[fontFamily] = 1;
    }
  }
  let maxLang;
  let maxLangCount = 0;
  for (let lang in langCounts) {
    if (langCounts.hasOwnProperty(lang)) {
      if (langCounts[lang] > maxLangCount) {
        maxLangCount = langCounts[lang];
        maxLang = lang;
      }
    }
  }
  if (maxLang)
    page.language = maxLang;
  else
    page.language = defaultLang;

  let maxFontFamily;
  let maxFontFamilyCount = 0;
  for (let fontFamily in fontFamilyCounts) {
    if (fontFamilyCounts.hasOwnProperty(fontFamily)) {
      if (fontFamilyCounts[fontFamily] > maxFontFamilyCount) {
        maxFontFamilyCount = fontFamilyCounts[fontFamily];
        maxFontFamily = fontFamily;
      }
    }
  }
  if (maxFontFamily)
    page.fontFamily = maxFontFamily;
  else
    page.fontFamily = defaultFontFamily;

  let defaultFont = fontFamilyMap[page.fontFamily];
  if (defaultFont) {
    if (defaultFont.fontType!=null) {
      page.fontType = defaultFont.fontType;
    }
    if (defaultFont.fontStyle!=null) {
      page.fontStyle = defaultFont.fontStyle;
    }
    if (defaultFont.fontWidth!=null) {
      page.fontWidth = defaultFont.fontWidth;
    }
  }
  page.fontSize = fontSizeMap[defaultFontSize];

  removeSuperfluousProperties();

  buildFullContent();

  canvas.renderAll();

  $('#chkAllowAdd').prop('checked', false);
  loadProperties();
  setText();

  workOnItems("textBlock");
}

function loadAltoComposedBlock(composedBlockTag, styles) {
  // we'll assume there are not any recursive composed blocks
  let composedBlock = newComposedBlock(0, 0, 100, 100);
  addTagAttributes(composedBlockTag, composedBlock, styles);

  let textBlockTags = composedBlockTag.getElementsByTagName("TextBlock");
  for (let j = 0; j < textBlockTags.length; j++) {
    let textBlockTag = textBlockTags[j];

    let textBlock = this.loadAltoTextBlock(textBlockTag, styles, composedBlock);

    composedBlock.textBlocks.push(textBlock);
  }

  let illustartionTags = composedBlockTag.getElementsByTagName("Illustration");
  for (let j = 0; j < illustartionTags.length; j++) {
    let illustrationTag = illustartionTags[j];

    let illustration = this.loadAltoIllustration(illustrationTag);
    illustration.parent = composedBlock;

    composedBlock.illustrations.push(illustration);
  }
}

function loadAltoIllustration(illustrationTag) {
  let left = parseInt(illustrationTag.getAttribute("HPOS"));
  let top = parseInt(illustrationTag.getAttribute("VPOS"));
  let width = parseInt(illustrationTag.getAttribute("WIDTH"));
  let height = parseInt(illustrationTag.getAttribute("HEIGHT"));

  let illustration = newIllustration(left, top, width, height);
  return illustration;
}

function addTagAttributes(tag, element, styles) {
  if (tag.hasAttribute("LANG"))
    element.language = tag.getAttribute("LANG");
  if (tag.hasAttribute("STYLEREFS")) {
    let styleId = tag.getAttribute("STYLEREFS");
    let style = styles[styleId];
    if (style) {
      if (style.fontFamily)
        element.fontFamily = style.fontFamily;
      if (style.fontSize)
        element.fontSize = style.fontSize;
      if (style.fontType)
        element.fontType = style.fontType;
      if (style.fontWidth)
        element.fontWidth = style.fontWidth;
      if (style.fontStyle) {
        element.fontStyle = style.fontStyle;
      } else {
        element.fontStyle = "none";
      }
    }
  }
  if (tag.hasAttribute("TAGREFS")) {
    let tagRefs = tag.getAttribute("TAGREFS").split(" ");
    for (let i=0; i < tagRefs.length; i++) {
      let tagRef = tagRefs[i];
      for (let j=0; j<layoutTags.length; j++) {
        let layoutTag = layoutTags[j];
        if (tagRef===`Layout-${layoutTag[0]}`) {
          element.layoutTag = tagRef.substring("Layout-".length);
          break;
        }
      }
      for (let j=0; j<structureTags.length; j++) {
        let structureTag = structureTags[j];
        if (tagRef===`Struct-${structureTag[0]}`) {
          element.structureTag = tagRef.substring("Struct-".length);
          break;
        }
      }
    }
  }
}

function loadAltoTextBlock(textBlockTag, styles, parent) {
  let tbLeft = parseInt(textBlockTag.getAttribute("HPOS"));
  let tbTop = parseInt(textBlockTag.getAttribute("VPOS"));
  let tbWidth = parseInt(textBlockTag.getAttribute("WIDTH"));
  let tbHeight = parseInt(textBlockTag.getAttribute("HEIGHT"));
  let leftTop = rotate(tbLeft, tbTop, rotation);
  let botRight = rotate(tbLeft + tbWidth, tbTop + tbHeight, rotation);
  tbLeft = leftTop.x;
  tbTop = leftTop.y;
  let tbRight = botRight.x;
  let tbBottom = botRight.y;

  console.log(`textBlock: ${tbLeft}, ${tbTop}, ${tbRight}, ${tbBottom}`);

  let textBlock = newTextBlock(
    Math.round(tbLeft),
    Math.round(tbTop),
    Math.round(tbRight - tbLeft),
    Math.round(tbBottom - tbTop)
  );
  textBlock.parent = parent;

  addTagAttributes(textBlockTag, textBlock, styles);

  tbLeft = Number.MAX_SAFE_INTEGER;
  tbTop = Number.MAX_SAFE_INTEGER;
  tbRight = 0;
  tbBottom = 0;

  let hasLineWithNoStrings = false;
  let textLineTags = textBlockTag.getElementsByTagName("TextLine");
  for (let k=0; k < textLineTags.length; k++) {
    let textLineTag = textLineTags[k];
    let tlLeft = parseInt(textLineTag.getAttribute("HPOS"));
    let tlTop = parseInt(textLineTag.getAttribute("VPOS"));
    let baseline = parseInt(textLineTag.getAttribute("BASELINE"));
    let tlWidth = parseInt(textLineTag.getAttribute("WIDTH"));
    let tlHeight = parseInt(textLineTag.getAttribute("HEIGHT"));
    let tlBaseLine = rotate(tlLeft, baseline, rotation);
    let tlLeftTop = rotate(tlLeft, tlTop, rotation);
    let tlBotRight = rotate(tlLeft + tlWidth, tlTop, rotation);

    let linePoints = [Math.round(tbLeft), Math.round(tlBaseLine.y), Math.round(tbRight), Math.round(tlBaseLine.y)];
    console.log("textLineTag: %d, %d, %d, %d, %d", tlLeft, tlTop, tlLeft+tlWidth, tlTop+tlHeight, baseline);
    console.log("line: {%f, %f}, {%f, %f}", linePoints[0], linePoints[1], linePoints[2], linePoints[3]);

    let textLine = newTextLine(textBlock, Math.round(tlBaseLine.y), 0, 10);
    addTagAttributes(textLineTag, textLine, styles);

    let stringTags = textLineTag.children;
    if (stringTags.length==0)
      hasLineWithNoStrings = true;
    let followsSpace = false;
    let prevString = null;
    for (let l=0; l < stringTags.length; l++) {
      let stringTag = stringTags[l];
      if (stringTag.tagName==="String") {
        let sLeft = parseInt(stringTag.getAttribute("HPOS"));
        let sTop = parseInt(stringTag.getAttribute("VPOS"));
        let sWidth = parseInt(stringTag.getAttribute("WIDTH"));
        let sHeight = parseInt(stringTag.getAttribute("HEIGHT"));
        let sRight = sLeft + sWidth;
        let sBottom = sTop + sHeight;
        let sContent = stringTag.getAttribute("CONTENT");
        let sLeftTop = rotate(sLeft, sTop, rotation);
        let sRightBottom = rotate(sRight, sBottom, rotation);
        sWidth = sRightBottom.x - sLeftTop.x;
        console.log(`String coords ${sLeft}, ${sTop} => ${sLeftTop.x}, ${sLeftTop.y}`);

        let string = newString(textLine, Math.round(sLeftTop.x), Math.round(sWidth));
        string.content = sContent;
        addTagAttributes(stringTag, string, styles);

        if (sLeftTop.x < tbLeft)
          tbLeft = sLeftTop.x;
        if (sLeftTop.y < tbTop)
          tbTop = sLeftTop.y;
        if (sRightBottom.x > tbRight)
         tbRight = sRightBottom.x;
        if (sRightBottom.y > tbBottom)
          tbBottom = sRightBottom.y;

        let glyphTags = stringTag.getElementsByTagName("Glyph");

        for (let m = 0; m < glyphTags.length; m++) {
          let glyphTag = glyphTags[m];
          let gLeft = parseInt(glyphTag.getAttribute("HPOS"));
          let gTop = parseInt(glyphTag.getAttribute("VPOS"));
          let gWidth = parseInt(glyphTag.getAttribute("WIDTH"));
          let gHeight = parseInt(glyphTag.getAttribute("HEIGHT"));
          let gLeftTop = rotate(gLeft, gTop, rotation);
          let gBotRight = rotate(gLeft + gWidth, gTop + gHeight, rotation);
          if (gLeftTop.x < tbLeft)
            tbLeft = gLeftTop.x;
          if (gLeftTop.y < tbTop)
            tbTop = gLeftTop.y;
          if (gBotRight.x > tbRight)
            tbRight = gBotRight.x;
          if (gBotRight.y > tbBottom)
            tbBottom = gBotRight.y;
        }

        for (let m=1; m<glyphTags.length; m++) {
          let glyphTag1 = glyphTags[m-1];
          let glyphTag2 = glyphTags[m];
          let midlineX;
          let g1Left = parseInt(glyphTag1.getAttribute("HPOS"));
          let g2Left = parseInt(glyphTag2.getAttribute("HPOS"));
          if (g1Left < g2Left) {
            let g1Right = g1Left + parseInt(glyphTag1.getAttribute("WIDTH"));
            midlineX = (g1Right + g2Left) / 2;
          } else {
            let g2Right = g2Left + parseInt(glyphTag2.getAttribute("WIDTH"));
            midlineX = (g2Right + g1Left) / 2;
          }
          let glyphPoint = rotate(midlineX, sTop, rotation);
          let glyph = newGlyph(string, Math.round(glyphPoint.x));
        } // next glyph
        sortGlyphs(string);
        followsSpace = false;
        prevString = string;
      } else if (stringTag.tagName==="SP") {
        // space
        followsSpace = true;
      } else if (stringTag.tagName==="HYP") {
        // TextLine can contain a single hyphen at the end of the line
        let sLeft = parseInt(stringTag.getAttribute("HPOS"));
        let sTop = parseInt(stringTag.getAttribute("VPOS"));
        let sWidth = parseInt(stringTag.getAttribute("WIDTH"));
        let sHeight = parseInt(stringTag.getAttribute("HEIGHT"));
        let sRight = sLeft + sWidth;
        let sBottom = sTop + sHeight;
        let sContent = stringTag.getAttribute("CONTENT");
        let sLeftTop = rotate(sLeft, sTop, rotation);
        let sRightBottom = rotate(sRight, sBottom, rotation);
        sWidth = sRightBottom.x - sLeftTop.x;
        console.log(`Hyphen coords ${sLeft}, ${sTop} => ${sLeftTop.x}, ${sLeftTop.y}`);

        // The big question is: should the hyphen be combined with the final string?
        // We answer it as follows: if separated from string by a space (SP), it's alone
        // otherwise it's combined
        if (followsSpace || prevString === null) {
          let string = newString(textLine, Math.round(sLeftTop.x), Math.round(sWidth));
          string.content = sContent;
          addTagAttributes(stringTag, string, styles);
        } else {
          // combine with previous string
          // update content to include hyphen
          prevString.content = prevString.content + sContent;
          // update coordinates and width
          let hyphenLeft = Math.round(sLeftTop.x);
          let hyphenRight = Math.round(sRightBottom.x);
          if (hyphenLeft < prevString.leftNoZoom) {
            prevString.width = prevString.width + (prevString.leftNoZoom - hyphenLeft);
            prevString.left = hyphenLeft * zoom;
            prevString.leftNoZoom = hyphenLeft;
          } else if (hyphenRight > (prevString.leftNoZoom + prevString.width)) {
            prevString.width = hyphenRight - prevString.leftNoZoom;
            prevString.right = hyphenRight * zoom;
          }
          // add glyph
          let leftToRight = isLeftToRight(prevString);
          if (leftToRight) {
            let glyph = newGlyph(prevString, Math.round(sLeftTop.x));
          } else {
            let glyph = newGlyph(prevString, Math.round(sRightBottom.x));
          }
          sortGlyphs(prevString);
        }
        followsSpace = false;
      }
    } // next stringTag

    sortStrings(textLine);
    resizeTextLine(textLine);
  } // next textLineTag

  // we only fit the textblock rectangle to its string contents if all of its lines have strings
  // if there are empty lines, we assume the textblock hasn't yet been completed, and we keep the original rectangle.
  if (!hasLineWithNoStrings && tbLeft < Number.MAX_SAFE_INTEGER && tbTop < Number.MAX_SAFE_INTEGER && tbRight > 0 && tbBottom > 0) {
    tbLeft -= 1;
    tbTop -= 1;
    tbRight += 2;
    tbBottom += 2;
    textBlock.left = tbLeft * zoom;
    textBlock.leftNoZoom = tbLeft;
    textBlock.top = tbTop * zoom;
    textBlock.topNoZoom = tbTop;
    textBlock.right = tbRight * zoom;
    textBlock.bottom = tbBottom * zoom;
    textBlock.width = tbRight - tbLeft;
    textBlock.height = tbBottom - tbTop;
    textBlock.dirty = true;
    textBlock.setCoords();
  }
  sortTextLines(textBlock);
  recalculateStringHeight(textBlock);

  return textBlock;
}

function removeSuperfluousProperties() {
  removeSuperfluousProperty(page, "language");
  removeSuperfluousProperty(page, "fontFamily");
  removeSuperfluousProperty(page, "fontType");
  removeSuperfluousProperty(page, "fontWidth");
  removeSuperfluousProperty(page, "fontStyle");
  removeSuperfluousProperty(page, "fontSize");
}

function removeSuperfluousProperty(element, property) {
  let value = getInheritedAttribute(element, property);
  checkIfPropertyRequired(element, property, value);
  if (element.name==="page") {
    let page = element;
    for (let i=0; i<page.composedBlocks.length; i++) {
      let composedBlock = page.composedBlocks[i];
      removeSuperfluousProperty(composedBlock, property);
    }
    for (let i=0; i<page.textBlocks.length; i++) {
      let textBlock = page.textBlocks[i];
      if (textBlock.parent===page) {
        removeSuperfluousProperty(textBlock, property);
      }
    }
  } else if (element.name==="composedBlock") {
    let composedBlock = element;
    for (let i=0; i<composedBlock.textBlocks.length; i++) {
      let textBlock = composedBlock.textBlocks[i];
      removeSuperfluousProperty(textBlock, property);
    }
  } else if (element.name==="textBlock") {
    let textBlock = element;
    for (let i=0; i<textBlock.textLines.length; i++) {
      let textLine = textBlock.textLines[i];
      removeSuperfluousProperty(textLine, property);
    }
  } else if (element.name==="textLine") {
    let textLine = element;
    for (let i=0; i<textLine.strings.length; i++) {
      let string = textLine.strings[i];
      removeSuperfluousProperty(string, property);
    }
  }
}