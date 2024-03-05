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

const rtlLangs = ["he", "yi", "ji", "ar", "fa", "ur", "dv", "ff", "heb", "yid", "ara", "per", "fas", "urd", "syc", "mid", "myz", "div", "man", "ful", "rhg", "en-Hebr"];
let rotation = 0.0;
let zoom = 1.0;
let itemType = "textBlock";
let cbCounter = 1;
let tbCounter = 1;
let tlCounter = 1;
let sCounter = 1;
let gCounter = 1;
let ilCounter = 1;
let dpi = 600;

const fontTypes = [
  "serif",
  "sans-serif"
];

const fontWidths = [
  "proportional",
  "fixed"
]

const fontStyles = [
  "none", // will be removed in Alto, but necessary for overriding a style inherited from an element's parent, e.g. non-italics string in an italics textblock
  "bold",
  "italics",
  "subscript",
  "superscript",
  "smallcaps",
  "underline"
]

// The top-level object to contain the Alto elements loaded or added by the user
let page = {
  name: "page",
  id: "page",
  composedBlocks: [],
  textBlocks: [],
  illustrations: [],
  graphicalElements: [],
  language: "",
};

// The currently selected element, or the page if nothing is selected
let selected = page;

const composedBlockColor="orange";
const illustrationColor="blue";
const graphicalElementColor="red";
const textBlockColor = "black";
const textLineColor = "blue";
const stringColor = "green";
const glyphColor = "red";
const glyphWidth = 1;
const stringWidth = 2;
const textLineWidth = 2;
const textBlockWidth = 2;
const illustrationWidth = 2;
const graphicalElementWidth = 2;
const composedBlockWidth=2;

let fontFamilyMap = {};
let fontSizeMap = {};
let fontFamilies = [];
let fontSizes = [];
let layoutTagMap = {};
let structureTagMap = {};

$( document ).ready(function() {
  config();

  for (let i=0;i<initialFontFamilies.length;i++){
    fontFamilyMap[initialFontFamilies[i][0]] = initialFontFamilies[i][1]
    fontFamilies.push(initialFontFamilies[i][0]);
  }

  for (let i=0;i<initialFontSizes.length;i++){
    fontSizeMap[initialFontSizes[i][0]] = initialFontSizes[i][1]
    fontSizes.push(initialFontSizes[i]);
  }

  loadDropDowns();
  loadProperties();
  zoomFonts(1.0);

  $('.alert .close').click(function(){
    $(this).parent().hide();
    let modal = $(this).closest('.modal');
    if (modal)
      modal.modal('hide');
  });

  $('#btnExtendModal').click(function() {
    $('#alertExtendSuccess').hide();
    $("#extendModal").modal();
  });
  $('#btnExtendStrings').click(function() {
    extendStrings();
    $('#alertExtendSuccess').show();
  });
});

function loadDropDowns() {
  page.language = defaultLanguage;

  let option = '<option value="">inherited</option>';
  for (let i=0;i<fontFamilies.length;i++){
     option += `<option value="${fontFamilies[i]}">${fontFamilies[i]}</option>`;
  }
  $('#fontFamily').find('option').remove().end();
  $('#fontFamily').append(option);
  $('#fontFamily').val(defaultFontFamily);
  page.fontFamily = defaultFontFamily;

  let defaultFont = fontFamilyMap[defaultFontFamily];

  option = '<option value="">none</option>';
  for (let i=0;i<fontTypes.length;i++){
    option += `<option value="${fontTypes[i]}">${fontTypes[i]}</option>`;
  }
  $('#fontType').find('option').remove().end();
  $('#fontType').append(option);
  if (defaultFont.fontType!=null) {
    $('#fontType').val(defaultFont.fontType);
    page.fontType = defaultFont.fontType;
  } else {
    $('#fontType').val("");
    delete page.fontType;
  }

  option = '<option value="">none</option>';
  for (let i=0;i<fontWidths.length;i++){
     option += `<option value="${fontWidths[i]}">${fontWidths[i]}</option>`;
  }
  $('#fontWidth').find('option').remove().end();
  $('#fontWidth').append(option);
  if (defaultFont.fontWidth!=null) {
    $('#fontWidth').val(defaultFont.fontWidth);
    page.fontWidth = defaultFont.fontWidth;
  } else {
    $('#fontWidth').val("");
    delete page.fontWidth;
  }

  option = '<option value="">none</option>';
  for (let i=0;i<fontStyles.length;i++){
     option += `<option value="${fontStyles[i]}">${fontStyles[i]}</option>`;
  }
  $('#fontStyle').find('option').remove().end();
  $('#fontStyle').append(option);
  $('#fontStyle option[value=none]').hide();
  if (defaultFont.fontStyle!=null) {
    $('#fontStyle').val(defaultFont.fontStyle);
    page.fontStyle = defaultFont.fontStyle;
  } else {
    $('#fontStyle').val("");
    delete page.fontStyle;
  }

  option = '<option value="">none</option>';
  for (let i=0;i<fontSizes.length;i++){
    if (fontSizes[i][0]===defaultFontSize)
      page.fontSize = fontSizes[i][0];
    option += `<option value="${fontSizes[i][0]}">${fontSizes[i][1]}</option>`;
  }
  $('#fontSize').find('option').remove().end();
  $('#fontSize').append(option);
  $('#fontSize').val(defaultFontSize);

  layoutTagMap = {}
  option = '<option value="">none</option>';
  for (let i=0;i<layoutTags.length;i++){
    option += `<option value="${layoutTags[i][0]}">${layoutTags[i][1]}</option>`;
    layoutTagMap[layoutTags[i][0]] = layoutTags[i][1];
  }
  $('#layoutTag').find('option').remove().end();
  $('#layoutTag').append(option);

  structureTagMap = {}
  option = '<option value="">none</option>';
  for (let i=0;i<allStructureTags.length;i++){
    option += `<option value="${allStructureTags[i][0]}">${allStructureTags[i][1]}</option>`;
    structureTagMap[allStructureTags[i][0]] = allStructureTags[i][1];
  }
  $('#structureTag').find('option').remove().end();
  $('#structureTag').append(option);
}

function rotateImage(angle) {
  console.log(`Rotating by ${angle}`);
  rotation += angle;
  if (rotation > 180) {
    rotation = rotation - 360;
  }
  document.getElementById("rotation").innerHTML = rotation.toFixed(2);
  let bi = canvas.backgroundImage;
  if (bi!=null) {
    bi.rotate(0 - canvas.backgroundImage.angle);
    bi.rotate(rotation);
    bi.setCoords();

    // Rotate all existing objects together with background image
    for (let i=0; i<page.textBlocks.length; i++) {
      let textBlock = page.textBlocks[i];
      rotateTextBlock(textBlock, angle);
    }

    for (let i=0; i<page.illustrations.length; i++) {
      let illustration = page.illustrations[i];
      rotateObject(illustration, angle);
    }

    for (let i=0; i<page.graphicalElements.length; i++) {
      let graphicalElement = page.graphicalElements[i];
      rotateObject(graphicalElement, angle);
    }

    resizeComposedBlocks();

    canvas.renderAll();
  }
}

function rotateTextBlock(textBlock, angle) {
  rotateObject(textBlock, angle);
  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    rotateObject(textLine, angle);
    for (let j=0; j<textLine.strings.length; j++) {
      let string = textLine.strings[j];
      rotateObject(string, angle);
      for (let k=0; k<string.glyphs.length; k++) {
        let glyph = string.glyphs[k];
        rotateObject(glyph, angle);
      }
    }
    resizeTextLine(textLine);
  }
  resizeTextBlock(textBlock);
}

function rotateObject(object, angle) {
  let rightNoZoom = object.right / zoom;
  let bottomNoZoom = object.bottom / zoom;
  let leftTop = rotate(object.leftNoZoom, object.topNoZoom, angle);
  let rightBottom = rotate(rightNoZoom, bottomNoZoom, angle);
  object.leftNoZoom = leftTop.x;
  object.topNoZoom = leftTop.y;
  object.left = leftTop.x * zoom;
  object.top = leftTop.y * zoom;
  if (object.name==="glyph") {
    object.right = object.left;
    object.width = 0;
  } else {
    object.right = rightBottom.x * zoom;
    object.width = rightBottom.x - leftTop.x;
  }
  if (object.name==="textLine") {
    object.bottom = object.top
    object.height = 0;
  } else {
    object.bottom = rightBottom.y * zoom;
   object.height = rightBottom.y - leftTop.y;
  }
  object.dirty = true;
  object.setCoords();
}

//==================================================================================
// Mathematical functions.
//==================================================================================
/**
* Given x1, y1 and x2, where
* theta is an angle (in counter-clockwise degrees)
* defining a vector starting at (x1, y1),
* returns y2: the y coordinate of the point along
* this vector where it intercepts the vertical line passing through x2.
*/
function getIntercept(x1, y1, x2, theta) {
  // since theta is counter-clockwise, but our origin is top-left
  // we need to take the inverse of theta
  let rad = (0 - theta) * (Math.PI / 180);
  let slope = Math.tan(rad);
  let y2 = ((x2 - x1) * slope) + y1;
  return y2;
}

/**
* Given unzoomed x and y and an angle, returns the point after rotation.
*/
function rotate(x1, y1, angle) {
  if (angle==0)
    return new fabric.Point(x1, y1);
  let x0 = (canvas.width / zoom) / 2;
  let y0 = (canvas.height / zoom) / 2;
  let origin = new fabric.Point(x0, y0);
  let radians = fabric.util.degreesToRadians(angle);
  let rotated = fabric.util.rotatePoint(new fabric.Point(x1,y1), origin, radians);
  let rounded = new fabric.Point(rotated.x, rotated.y);
  return rounded;
}

//==================================================================================
// Functions for zooming items.
//==================================================================================
function zoomCanvas(canvas, zoom) {
  canvas.setHeight(canvas.heightNoZoom * (zoom / canvas.originalZoom));
  canvas.setWidth(canvas.widthNoZoom * (zoom / canvas.originalZoom));
}

function zoomBackground(canvas, zoom) {
  if (canvas.backgroundImage) {
    let bi = canvas.backgroundImage;
    let angle = bi.angle;
    bi.rotate(0);
    bi.top = 0;
    bi.left = 0;

    bi.scaleX = zoom;
    bi.scaleY = zoom;
    bi.setCoords();
    bi.rotate(angle);
    bi.setCoords();

    canvas.renderAll();
    canvas.calcOffset();
  }
}

function zoomObject(object, zoom) {
  object.scaleX = zoom;
  object.scaleY = zoom;
  object.left = object.leftNoZoom * zoom;
  object.top = object.topNoZoom * zoom;
  object.right = object.left + object.width * zoom;
  object.bottom = object.top + object.height * zoom;
  if (object.name==="glyph")
    object.strokeWidth = glyphWidth / zoom;
  else if (object.name==="string")
    object.strokeWidth = stringWidth / zoom;
  else if (object.name==="textLine")
    object.strokeWidth = textLineWidth / zoom;
  else if (object.name==="textBlock")
    object.strokeWidth = textBlockWidth / zoom;
  else if (object.name==="composedBlock")
    object.strokeWidth = composedBlockWidth / zoom;
  else if (object.name==="illustration")
    object.strokeWidth = illustrationWidth / zoom;
  else if (object.name==="graphicalElement")
    object.strokeWidth = graphicalElementWidth / zoom;
  object.setCoords();
}

function zoomObjects(canvas, zoom) {
  let objects = canvas.getObjects();
  for (let i in objects) {
    zoomObject(objects[i], zoom);
  }
  canvas.renderAll();
  canvas.calcOffset();
}

function setDpi() {
  dpi = Number($("#dpi").val());
  zoomFonts(zoom);
}

function zoomFonts(zoom) {
  let leftToRight = isLeftToRight(page);

  $( ".textSample" ).removeClass("rtl")
  if (!leftToRight) {
    $( ".textSample" ).addClass("rtl")
  }
  $( ".pt24" ).html(sampleText);
  $( ".pt18" ).html(sampleText);
  $( ".pt14" ).html(sampleText);
  $( ".pt12" ).html(sampleText);
  $( ".pt9" ).html(sampleText);

  let pixels = Math.round(24 * (dpi / 72) * zoom).toFixed(0);
  $( ".pt24" ).css( "font-size", `${pixels}px` );
  pixels = Math.round(18 * (dpi / 72) * zoom).toFixed(0);
  $( ".pt18" ).css( "font-size", `${pixels}px` );
  pixels = Math.round(14 * (dpi / 72) * zoom).toFixed(0);
  $( ".pt14" ).css( "font-size", `${pixels}px` );
  pixels = Math.round(12 * (dpi / 72) * zoom).toFixed(0);
  $( ".pt12" ).css( "font-size", `${pixels}px` );
  pixels = Math.round(9 * (dpi / 72) * zoom).toFixed(0);
  $( ".pt9" ).css( "font-size", `${pixels}px` );
}

/**
* Zoom all canvas elements to a new zoom factor.
* Strokes will continue to appear with original width.
*/
function zoomAll(newZoom, canvas) {
  //let factor = newZoom / zoom;
  zoom = newZoom;
  zoomCanvas(canvas, newZoom);
  zoomBackground(canvas, newZoom);
  zoomObjects(canvas, newZoom);
  zoomFonts(newZoom);
}

let adjustZoom = function(event, slider, canvas) {
  let sliderValue = slider.value;
  console.log(`${slider}, slider value: ${sliderValue}`);
  zoomAll(sliderValue / 100, canvas);
  $("#zoom").html(`${slider.value}%`);
}

//==================================================================================
// Functions for creating new items.
//==================================================================================

/**
* Create a new composedBlock.
* Assumes all coordinates provided are unzoomed.
*/
function newComposedBlock(left, top, width, height) {
  let composedBlock = new fabric.Rect({
    bottom: top + height,
    fill: 'rgba(0,0,0,0)',
    height: height,
    id: `composedBlock_${cbCounter++}`,
    graphicalElements: [],
    illustrations: [],
    left: left,
    leftNoZoom: left,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: false,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'composedBlock',
    parent: page,
    right: left + width,
    stroke: composedBlockColor,
    strokeWidth: composedBlockWidth,
    textBlocks: [],
    top: top,
    topNoZoom: top,
    width: width,
  });

  zoomObject(composedBlock, zoom);
  console.log(`added ${composedBlock.id} at ${composedBlock.left.toFixed(2)} , ${composedBlock.top.toFixed(2)} with w ${composedBlock.width.toFixed(2)}, h ${composedBlock.height.toFixed(2)}`);

  page.composedBlocks.push(composedBlock);
  canvas.add(composedBlock);

  return composedBlock;
}

/**
* Create a new illustration.
* Assumes all coordinates provided are unzoomed.
*/
function newIllustration(left, top, width, height) {
  let illustration = new fabric.Rect({
    bottom: top + height,
    fill: 'rgba(0,0,0,0)',
    height: height,
    id: `illustration_${ilCounter++}`,
    left: left,
    leftNoZoom: left,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: false,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'illustration',
    parent: page,
    right: left + width,
    stroke: illustrationColor,
    strokeWidth: illustrationWidth,
    top: top,
    topNoZoom: top,
    width: width,
  });

  zoomObject(illustration, zoom);

  console.log(`added ${illustration.id} at ${illustration.left.toFixed(2)} , ${illustration.top.toFixed(2)} with w ${illustration.width.toFixed(2)}, h ${illustration.height.toFixed(2)}`);

  page.illustrations.push(illustration);
  canvas.add(illustration);

  return illustration;
}

/**
* Create a new graphical element.
* Assumes all coordinates provided are unzoomed.
*/
function newGraphicalElement(left, top, width, height) {
  let graphicalElement = new fabric.Rect({
    bottom: top + height,
    fill: 'rgba(0,0,0,0)',
    height: height,
    id: `graphicalElement_${ilCounter++}`,
    left: left,
    leftNoZoom: left,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: false,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'graphicalElement',
    parent: page,
    right: left + width,
    stroke: graphicalElementColor,
    strokeWidth: graphicalElementWidth,
    top: top,
    topNoZoom: top,
    width: width,
  });

  zoomObject(graphicalElement, zoom);

  console.log(`added ${graphicalElement.id} at ${graphicalElement.left.toFixed(2)} , ${graphicalElement.top.toFixed(2)} with w ${graphicalElement.width.toFixed(2)}, h ${graphicalElement.height.toFixed(2)}`);

  page.graphicalElements.push(graphicalElement);
  canvas.add(graphicalElement);

  return graphicalElement;
}

/**
* Create a new textBlock.
* Assumes all coordinates provided are unzoomed.
*/
function newTextBlock(left, top, width, height) {
  let textBlock = new fabric.Rect({
    bottom: top + height,
    fill: 'rgba(0,0,0,0)',
    height: height,
    id: `textBlock_${tbCounter++}`,
    left: left,
    leftNoZoom: left,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: false,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'textBlock',
    parent: page,
    right: left + width,
    stroke: textBlockColor,
    strokeWidth: textBlockWidth,
    textLines: [],
    top: top,
    topNoZoom: top,
    width: width,
  });

  // disable corner controls, to force user to edit only vertical or horizontal and reduce possibility of messing up
  textBlock.setControlsVisibility({
    tl: false,
    tr: false,
    bl: false,
    br: false,
  });

  zoomObject(textBlock, zoom);

  console.log(`added ${textBlock.id} at ${textBlock.left.toFixed(2)} , ${textBlock.top.toFixed(2)} with w ${textBlock.width.toFixed(2)}, h ${textBlock.height.toFixed(2)}`);

  page.textBlocks.push(textBlock);
  canvas.add(textBlock);

  return textBlock;
}

/**
* Create a new textLine.
* Assumes y is unzoomed.
*/
function newTextLine(textBlock, y, stringTop, stringHeight) {
  let textLine = new fabric.Line([textBlock.left / zoom, y, textBlock.left / zoom + textBlock.width, y], {
    bottom: y,
    id: `textLine_${tlCounter++}`,
    left: textBlock.leftNoZoom,
    leftNoZoom: textBlock.leftNoZoom,
    lockMovementX: true,
    lockMovementY: false,
    lockRotation: true,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'textLine',
    parent: textBlock,
    right: textBlock.leftNoZoom + textBlock.width,
    stringHeight: stringHeight,
    stringTop: stringTop,
    strings: [],
    stroke: textLineColor,
    strokeWidth: textLineWidth,
    top: y,
    topNoZoom: y
  });

  zoomObject(textLine, zoom);
  console.log(`added ${textLine.id} to ${textBlock.id} at ${textLine.left.toFixed(2)} , ${textLine.top.toFixed(2)} with w ${textLine.width.toFixed(2)}`);

  textBlock.textLines.push(textLine);

  canvas.add(textLine);
  return textLine;
}

/**
* Create a new string.
* Assumes left and width are unzoomed.
*/
function newString(textLine, left, width) {
  let string = new fabric.Rect({
    bottom: textLine.stringTop + textLine.stringHeight,
    content: '',
    fill: 'rgba(0,0,0,0)',
    glyphs: [],
    height: textLine.stringHeight,
    id: `string_${sCounter++}`,
    left: left,
    leftNoZoom: left,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    name: 'string',
    parent: textLine,
    right: left + width,
    stroke: stringColor,
    strokeWidth: stringWidth,
    top: textLine.stringTop,
    topNoZoom: textLine.stringTop,
    width: width,
  });

  zoomObject(string, zoom);

  console.log(`added ${string.id} to ${textLine.id} at ${string.left.toFixed(2)} , ${string.top.toFixed(2)} with w ${string.width.toFixed(2)}`);

  textLine.strings.push(string);

  canvas.add(string);
  return string;
}

/**
* Create a new glyph.
* Assumes x is unzoomed.
*/
function newGlyph(string, x) {
  let glyphPoints = [x, string.top / zoom, x, string.top / zoom+string.height];

  let glyph = new fabric.Line(glyphPoints, {
    bottom: top + string.height,
    height: string.height,
    id: `glyph_${gCounter++}`,
    left: glyphPoints[0],
    leftNoZoom: glyphPoints[0],
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingFlip: true,
    lockScalingX: true,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: true,
    name: 'glyph',
    parent: string,
    right: glyphPoints[0],
    stroke: glyphColor,
    strokeWidth: glyphWidth,
    top: glyphPoints[1],
    topNoZoom: glyphPoints[1],
  })

  zoomObject(glyph, zoom);

  string.glyphs.push(glyph);
  canvas.add(glyph);
  return glyph;
}

//==================================================================================
// Functions for sorting items.
//==================================================================================
function sortDescendents(element) {
  if (element.name==="page") {
    sortComposedBlocks();
    sortTextBlocks(element);
    sortIllustrations(element);
    for (let i=0; i<element.composedBlocks.length; i++) {
      let composedBlock = element.composedBlocks[i];
      sortTextBlocks(composedBlock);
      sortIllustrations(composedBlock);
      sortGraphicalElements(composedBlock);
    }
    for (let i=0; i<element.textBlocks.length; i++) {
      let textBlock = element.textBlocks[i];
      sortDescendents(textBlock);
    }
  } else if (element.name==="composedBlock") {
    sortTextBlocks(element);
    sortIllustrations(element);
    sortGraphicalElements(element);
    for (let i=0; i<element.textBlocks.length; i++) {
      let textBlock = element.textBlocks[i];
      sortDescendents(textBlock);
    }
  } else if (element.name==="textBlock") {
    sortTextLines(element);
    for (let i=0; i<element.textLines.length; i++) {
      let textLine = element.textLines[i];
      sortDescendents(textLine);
    }
  } else if (element.name==="textLine") {
    sortStrings(element);
    for (let i=0; i<element.strings.length; i++) {
      let string = element.strings[i];
      sortDescendents(string);
    }
  } else if (element.name==="string") {
    sortGlyphs(element);
  }
}

function sortComposedBlocks() {
  let leftToRight = isLeftToRight(page);
  let composedBlocks = page.composedBlocks;
  sortBlocksOnPage(composedBlocks, leftToRight)
  page.composedBlocks = composedBlocks;
}

/**
Sort text blocks, taking into account the possibility of them being included in composed blocks.
If text blocks are included in the same composed block, they are compared like standard text blocks.
Otherwise, if a text block is in a composed block, the composed block is compared instead of the text block.
This ensures text blocks for the same block are always grouped together when sorting.

The element can either be the page, in which case all text blocks are sorted, or a composed block.
*/
function sortTextBlocks(element) {
  let leftToRight = isLeftToRight(element);
  let textBlocks = element.textBlocks;
  if (element.name=="page") {
    sortBlocksOnPage(textBlocks, leftToRight);
    element.textBlocks = textBlocks;
  } else {
    sortBlocks(textBlocks, leftToRight);
    element.textBlocks = textBlocks;
  }
}

function sortIllustrations(element) {
  let leftToRight = isLeftToRight(element);
  let illustrations = element.illustrations;
  element.illustrations = sortBlocks(illustrations, leftToRight);
}

function sortGraphicalElements(element) {
  let leftToRight = isLeftToRight(element);
  let graphicalElements = element.graphicalElements;
  element.graphicalElements = sortBlocks(graphicalElements, leftToRight);
}

/**
Sort blocks taking into account vertical breaks.
**/
function sortBlocksOnPage(blocks, leftToRight) {
  let topOrdered = blocks.map(function(x) { if (x.parent.name=="page") { return x } else { return x.parent }})
  topOrdered = new Set(topOrdered)
  topOrdered = Array.from(topOrdered)
  topOrdered = topOrdered.sort(function(a, b) {
    if (a.top != b.top) return a.top - b.top;
    if (a.bottom != b.bottom) return a.bottom - b.bottom;
    if (a.left != b.left) return a.left - b.left;
    if (a.right != b.right) return a.right - b.right;
    return 0;
  })

  blocks.sort(function(a, b) {
    let aObj = a;
    let bObj = b;
    if ((a.parent!==page || b.parent!==page) && a.parent !== b.parent) {
      if (a.parent!==page) aObj = a.parent;
      if (b.parent!==page) bObj = b.parent;
    }

    let topBlock = aObj;
    let bottomBlock = bObj;
    if (aObj.top > bObj.top) {
      topBlock = bObj;
      bottomBlock = aObj;
    }

    let i;
    for (i=0; i < topOrdered.length; i++) {
      if (topOrdered[i].top > topBlock.top) {
        break;
      }
    }

    let j;
    for (j=i; j < topOrdered.length; j++) {
      if (topOrdered[j].top >= bottomBlock.top) {
        break;
      }
    }
    j = j-1;
    if (j<i) {
      j = i;
    }

    let verticalBreakCandidates = [];
    if (i < topOrdered.length) {
      verticalBreakCandidates = topOrdered.slice(i, j);
    }
    //console.log(`topBlock: ${stringify(topBlock)}`)
    //console.log(`bottomBlock: ${stringify(bottomBlock)}`)
    //console.log(`verticalBreakCandidates: ${verticalBreakCandidates.map((x) => stringify(x))}`)

    let hasVerticalBreak = false;
    for (i=0; i < verticalBreakCandidates.length; i++) {
      let candidate = verticalBreakCandidates[i];
      //console.log(`candidate: ${stringify(candidate)}. htop ${horizontalOverlap(topBlock, candidate).toFixed(2)}, hbot ${horizontalOverlap(bottomBlock, candidate).toFixed(2)}, vtop ${verticalOverlap(topBlock, candidate).toFixed(2)}, vbot ${verticalOverlap(bottomBlock, candidate).toFixed(2)}`)
      if (horizontalOverlap(topBlock, candidate) > 0 && horizontalOverlap(bottomBlock, candidate) && verticalOverlap(topBlock, candidate) == 0 && verticalOverlap(bottomBlock, candidate) == 0) {
        //console.log(`verticalbreak: ${stringify(candidate)}`)
        hasVerticalBreak = true;
        break;
      }
    }

    if (hasVerticalBreak) {
      let result = verticalCompare(aObj, bObj, leftToRight);
      //console.log(`hasVerticalBreak. result ${result}. a ${stringify(a)}. b ${stringify(b)}`)
      return result;
    } else if (horizontalOverlap(aObj, bObj) > 0) {
      let result = verticalCompare(a, b, leftToRight);
      //console.log(`has horizontal overlap. result ${result}. a ${stringify(a)}. b ${stringify(b)}`)
      return result;
    } else {
      let result = horizontalCompare(aObj, bObj, leftToRight);
      //console.log(`no horizontal overlap. result ${result}. a ${stringify(a)}. b ${stringify(b)}`)
      return result;
    }
  });

  return blocks;
}

function horizontalOverlap(a, b) {
  let maxLeft = Math.max(a.left, b.left);
  let minRight = Math.min(a.right, b.right);
  let horizontalOverlap = minRight - maxLeft;
  if (horizontalOverlap < 0) {
    return 0.0;
  } else {
    return horizontalOverlap;
  }
}

function verticalOverlap(a, b) {
  let maxTop = Math.max(a.top, b.top);
  let minBottom = Math.min(a.bottom, b.bottom);
  let verticalOverlap = minBottom - maxTop;
  if (verticalOverlap < 0) {
    return 0.0;
  } else {
    return verticalOverlap;
  }
}

function horizontalCompare(a, b, leftToRight) {
  if (leftToRight) {
    if (a.left > b.left) return 1;
    if (b.left > a.left) return -1;
    if (a.right < b.right) return -1;
    if (b.right < a.right) return 1;
  } else {
    if (a.right > b.right) return -1;
    if (b.right > a.right) return 1;
    if (a.left < b.left) return 1;
    if (b.left < a.left) return -1;
  }
  if (a.top < b.top) return -1;
  if (b.top < a.top) return 1;
  if (a.bottom < b.bottom) return -1;
  if (b.bottom < a.bottom) return 1;
  return 0;
}

function verticalCompare(a, b, leftToRight) {
  if (a.top < b.top) return -1;
  if (b.top < a.top) return 1;
  if (a.bottom < b.bottom) return -1;
  if (b.bottom < a.bottom) return 1;
  if (leftToRight) {
    if (a.left > b.left) return 1;
    if (b.left > a.left) return -1;
    if (a.right < b.right) return -1;
    if (b.right < a.right) return 1;
    return 0;
  } else {
    if (a.right > b.right) return -1;
    if (b.right > a.right) return 1;
    if (a.left < b.left) return 1;
    if (b.left < a.left) return -1;
    return 0;
  }
}

function sortBlocks(elements, leftToRight) {
  if (leftToRight) {
    elements.sort(function(a, b){
      let aObj = a;
      let bObj = b;
      if ((a.parent!==page || b.parent!==page) && a.parent !== b.parent) {
        if (a.parent!==page) aObj = a.parent;
        if (b.parent!==page) bObj = b.parent;
      }

      // if there is vertical overlap and little horizontal overlap, sort horizontally
      let hOverlap = ((aObj.right < bObj.right ? aObj.right : bObj.right) - (aObj.left > bObj.left ? aObj.left : bObj.left)) /
        (aObj.width > bObj.width ? aObj.width * zoom : bObj.width * zoom);
      if (aObj.topNoZoom < bObj.topNoZoom + bObj.height && bObj.topNoZoom < aObj.topNoZoom + aObj.height && hOverlap < 0.1 && aObj.left != bObj.left)
        return aObj.left - bObj.left;
      if (aObj.top != bObj.top) return aObj.top - bObj.top;
      if (aObj.left != bObj.left) return aObj.left - bObj.left;
      return 0;
    });
  } else {
    elements.sort(function(a, b){
      let aObj = a;
      let bObj = b;
      if ((a.parent!==page || b.parent!==page) && a.parent !== b.parent) {
        if (a.parent!==page) aObj = a.parent;
        if (b.parent!==page) bObj = b.parent;
      }

      // if there is vertical overlap and little horizontal overlap, sort horizontally
      let hOverlap = ((aObj.right < bObj.right ? aObj.right : bObj.right) - (aObj.left > bObj.left ? aObj.left : bObj.left)) /
        (aObj.width > bObj.width ? aObj.width * zoom : bObj.width * zoom);
      if (aObj.topNoZoom < bObj.topNoZoom + bObj.height && bObj.topNoZoom < aObj.topNoZoom + aObj.height && hOverlap < 0.1 && aObj.leftNoZoom+aObj.width != bObj.leftNoZoom+bObj.width)
        return (bObj.leftNoZoom + bObj.width) - (aObj.leftNoZoom + aObj.width);
      if (aObj.top != bObj.top) return aObj.top - bObj.top;
      if (aObj.leftNoZoom+aObj.width != bObj.leftNoZoom+bObj.width) return (bObj.leftNoZoom + bObj.width) - (aObj.leftNoZoom + aObj.width);
      return 0;
    });
  }
  return elements;
}

function sortTextLines(element) {
  let leftToRight = isLeftToRight(element);
  let textLines = element.textLines;
  if (leftToRight) {
    textLines.sort(function(a,b){
      if (a.top != b.top) return a.top - b.top;
      if (a.left != b.left) return a.left - b.left;
      return 0;
    });
  } else {
    textLines.sort(function(a,b){
      if (a.top != b.top) return a.top - b.top;
      if (a.left != b.left) return b.left - a.left;
      return 0;
    });
  }
  element.textLines = textLines;
}

function sortStrings(element) {
  let leftToRight = isLeftToRight(element);
  let strings = element.strings;
  strings = sortStringArray(strings, leftToRight);
  element.strings = strings;
}

function sortStringArray(strings, leftToRight) {
  if (leftToRight) {
    strings.sort(function(a,b){
      if (a.left != b.left) return a.left - b.left;
      if (a.top != b.top) return a.top - b.top;
      return 0;
    });
  } else {
    strings.sort(function(a,b){
      if (a.left != b.left) return b.left - a.left;
      if (a.top != b.top) return a.top - b.top;
      return 0;
    });
  }
  return strings;
}

function sortGlyphs(element) {
  let leftToRight = isLeftToRight(element);
  let glyphs = element.glyphs;
  if (leftToRight) {
    glyphs.sort(function(a,b){
      if (a.left != b.left) return a.left - b.left;
      if (a.top != b.top) return a.top - b.top;
      return 0;
    });
  } else {
    glyphs.sort(function(a,b){
      if (a.left != b.left) return b.left - a.left;
      if (a.top != b.top) return a.top - b.top;
      return 0;
    });
  }
  element.glyphs = glyphs;
}

//==================================================================================
// Functions for manipulating items.
//==================================================================================

/**
* Recalculate the size of all composed blocks.
*/
function resizeComposedBlocks() {
  let toRemove = [];
  for (let i=0; i<page.composedBlocks.length; i++) {
    let composedBlock = page.composedBlocks[i];

    if (composedBlock.textBlocks.length===0 && composedBlock.illustrations.length===0 && composedBlock.graphicalElements.length===0) {
      toRemove.push(composedBlock);
      continue;
    }

    let left = Number.MAX_SAFE_INTEGER;
    let right = 0;
    let top = Number.MAX_SAFE_INTEGER;
    let bottom = 0;
    for (let j=0; j<composedBlock.textBlocks.length; j++) {
      let tb = composedBlock.textBlocks[j];
      tb.right = tb.left + tb.width * zoom;
      tb.bottom = tb.top + tb.height * zoom;
      if (tb.left < left)
        left = tb.left;
      if (tb.right > right)
        right = tb.right;
      if (tb.top < top)
        top = tb.top;
      if (tb.bottom > bottom)
        bottom = tb.bottom;
    }

    for (let j=0; j<composedBlock.illustrations.length; j++) {
      let il = composedBlock.illustrations[j];
      il.right = il.left + il.width * zoom;
      il.bottom = il.top + il.height * zoom;
      if (il.left < left)
        left = il.left;
      if (il.right > right)
        right = il.right;
      if (il.top < top)
        top = il.top;
      if (il.bottom > bottom)
        bottom = il.bottom;
    }

    for (let j=0; j<composedBlock.graphicalElements.length; j++) {
      let ge = composedBlock.graphicalElements[j];
      ge.right = ge.left + ge.width * zoom;
      ge.bottom = ge.top + ge.height * zoom;
      if (ge.left < left)
        left = ge.left;
      if (ge.right > right)
        right = ge.right;
      if (ge.top < top)
        top = ge.top;
      if (ge.bottom > bottom)
        bottom = ge.bottom;
    }

    left -= 2;
    top -= 2;
    right += 2;
    bottom += 2;

    composedBlock.left = left;
    composedBlock.top = top;
    composedBlock.width = (right - left) / zoom ;
    composedBlock.height = (bottom - top) / zoom;
    composedBlock.leftNoZoom = left / zoom;
    composedBlock.topNoZoom = top / zoom;
    composedBlock.right = right;
    composedBlock.bottom = bottom;
    composedBlock.dirty = true;
    composedBlock.setCoords();

    sortTextBlocks(composedBlock);
    console.log(`set ${composedBlock.id}: l ${composedBlock.left.toFixed(2)}, t ${composedBlock.top.toFixed(2)}, w ${composedBlock.width.toFixed(2)}, h ${composedBlock.height.toFixed(2)}`)
  }

  for (let i=0; i<toRemove.length; i++) {
    let composedBlock = toRemove[i];
    page.composedBlocks = page.composedBlocks.filter(function(item) {return item!=composedBlock;});
    canvas.remove(composedBlock);
  }
  sortComposedBlocks();
  sortTextBlocks(page);
  sortIllustrations(page);
  canvas.renderAll();
}

/**
* Resize TextBlock size based on its contents.
*/
function resizeTextBlock(textBlock) {
  if (textBlock.textLines.length==0)
    return;

  console.log(`before resize ${textBlock.id}: l ${textBlock.left.toFixed(2)}, t ${textBlock.top.toFixed(2)}, w ${textBlock.width.toFixed(2)}, h ${textBlock.height.toFixed(2)}`)

  let leftNoZoom = Number.MAX_SAFE_INTEGER;
  let rightNoZoom = 0;
  let topNoZoom = Number.MAX_SAFE_INTEGER;
  let bottomNoZoom = 0;

  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    if (textLine.leftNoZoom < leftNoZoom)
      leftNoZoom = textLine.leftNoZoom;
    if (textLine.leftNoZoom + textLine.width > rightNoZoom)
      rightNoZoom = textLine.leftNoZoom + textLine.width;
    if (textLine.stringTop < topNoZoom)
      topNoZoom = textLine.stringTop;
    if (textLine.stringTop + textLine.stringHeight > bottomNoZoom)
      bottomNoZoom = textLine.stringTop + textLine.stringHeight;
  }

  textBlock.leftNoZoom = leftNoZoom;
  textBlock.left = leftNoZoom * zoom;
  textBlock.width = rightNoZoom - leftNoZoom;
  textBlock.right = rightNoZoom * zoom;
  textBlock.topNoZoom = topNoZoom;
  textBlock.top = topNoZoom * zoom;
  textBlock.height = bottomNoZoom - topNoZoom;
  textBlock.bottom = bottomNoZoom * zoom;
  textBlock.dirty = true;
  textBlock.setCoords();

  console.log(`after resize ${textBlock.id}: l ${textBlock.left.toFixed(2)}, t ${textBlock.top.toFixed(2)}, w ${textBlock.width.toFixed(2)}, h ${textBlock.height.toFixed(2)}`)
}

/**
* Resize TextLine width based on its contents
*/
function resizeTextLine(textLine) {
  console.log(`before resize ${textLine.id}: l ${textLine.left.toFixed(2)}, t ${textLine.top.toFixed(2)}, w ${textLine.width.toFixed(2)}`)

  if (textLine.strings.length==0) {
    textLine.left = textLine.parent.left;
    textLine.leftNoZoom = textLine.parent.leftNoZoom;
    textLine.width = textLine.parent.width;
    textLine.right = textLine.parent.right;
  }
  else {
    let leftNoZoom = Number.MAX_SAFE_INTEGER;
    let rightNoZoom = 0;
    for (let i=0; i<textLine.strings.length; i++) {
      let string = textLine.strings[i];
      stringRight = string.leftNoZoom + string.width;
      if (string.leftNoZoom < leftNoZoom)
        leftNoZoom = string.leftNoZoom;
      if (stringRight > rightNoZoom)
        rightNoZoom = stringRight;
    }

    textLine.leftNoZoom = leftNoZoom;
    textLine.left = leftNoZoom * zoom;
    textLine.width = rightNoZoom - leftNoZoom;
    textLine.right = rightNoZoom * zoom;
  }
  textLine.dirty = true;
  textLine.setCoords();
  console.log(`after resize ${textLine.id}: l ${textLine.left.toFixed(2)}, t ${textLine.top.toFixed(2)}, w ${textLine.width.toFixed(2)}`)
}

/**
* Recalculate the string top and string height for all strings in the text block.
*/
function recalculateStringHeight(textBlock) {
  for (let i=0; i < textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];

    if (i==0) {
      // since we don't have a previous baseline at textLine zero, we "fake it",
      textLine.stringTop = textBlock.top / zoom;
      textLine.stringHeight = (textLine.top - textBlock.top) * 1.25 / zoom;
    } else {
      let prevLine = textBlock.textLines[i-1];
      textLine.stringTop = prevLine.stringTop + prevLine.stringHeight;
      textLine.stringHeight = (textLine.top - prevLine.top) / zoom;
    }
    for (let j=0; j < textLine.strings.length; j++) {
      let string = textLine.strings[j];

      string.top = textLine.stringTop * zoom;
      string.topNoZoom = textLine.stringTop;
      string.height = textLine.stringHeight;
      string.bottom = (string.topNoZoom + string.height) * zoom;
      string.dirty = true;
      string.setCoords();

      for (let k=0; k < string.glyphs.length; k++) {
        let glyph = string.glyphs[k];
        glyph.top = string.top;
        glyph.topNoZoom = textLine.stringTop;
        glyph.height = string.height;
        glyph.bottom = (glyph.topNoZoom + glyph.height) * zoom;
        glyph.dirty = true;
        glyph.setCoords();
      }
    }
  }
}

function displayAttribute(attribute, value) {
  let display = value;
  if (attribute==="fontSize") {
    display = fontSizeMap[value];
    if (display==null)
      display = value;
  } else if (attribute==="layoutTag") {
    display = layoutTagMap[value];
    if (display==null)
      display = value;
  } else if (attribute==="structureTag") {
    display = structureTagMap[value];
    if (display==null)
      display = value;
  }
  return display;
}

function getInheritedAttribute(element, attribute) {
  if (element[attribute])
    return element[attribute];
  if (element.parent)
    return getInheritedAttribute(element.parent, attribute);
  return "";
}

function isLeftToRight(element) {
  let language = getInheritedAttribute(element, "language");
  let leftToRight = rtlLangs.indexOf(language) < 0;
  return leftToRight;
}

function stringify(element) {
  let content = "";
  if (element.name=="composedBlock") {
    content = element.textBlocks[0].textLines[0].strings[0].content
  }
  return `${element.name}(${element.left.toFixed(2)}, ${element.top.toFixed(2)}, ${element.right.toFixed(2)}, ${element.bottom.toFixed(2)}, ${content})`
}