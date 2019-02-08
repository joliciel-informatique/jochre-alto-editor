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

let originalObject;
let startDrag;
let maxDiff = {
  // minimum vertical distance between two textlines to merge them together
  textlineMerge: 8,
  // minimum percentage of width leftover in textline to be considered a separate textline
  textLineSplitWidthPercent: 0.02,
  // minimum horizontal distance between two glyphs to merge them together
  glyphMerge: 2,
}

//==================================================================================
// Functions for editing.
//==================================================================================
function loadProperties() {
  $("#elementId").text(selected.id);

  let language = getInheritedAttribute(selected, "language");
  if (language==="") language = "none";
  if (selected===page)
    $("#elementLang").attr("placeholder", `${language}`);
  else {
    let parentLangauge = displayAttribute("language", getInheritedAttribute(selected.parent, "language"));
    $("#elementLang").attr("placeholder", `Inherited: ${parentLangauge}`);
  }
  if (selected.language)
    $("#elementLang").val(selected.language);
  else
    $('#elementLang').val("");

  let fontFamily = getInheritedAttribute(selected, "fontFamily");
  if (fontFamily==="") fontFamily = "none";
  if (selected===page)
    $('#fontFamily option[value=""]').text(`none`);
  else {
    let parentFontFamily = displayAttribute("fontFamily", getInheritedAttribute(selected.parent, "fontFamily"));
    $('#fontFamily option[value=""]').text(`Inherited: ${parentFontFamily}`);
  }
  if (selected.fontFamily)
    $('#fontFamily').val(selected.fontFamily);
  else
    $('#fontFamily').val("");

  let fontType = getInheritedAttribute(selected, "fontType");
  if (fontType==="") fontType = "none";
  if (selected===page)
    $('#fontType option[value=""]').text(`none`);
  else {
    let parentFontType = displayAttribute("fontType", getInheritedAttribute(selected.parent, "fontType"));
    $('#fontType option[value=""]').text(`Inherited: ${parentFontType}`);
  }
  if (selected.fontType)
    $('#fontType').val(selected.fontType);
  else
    $('#fontType').val("");

  let fontStyle = getInheritedAttribute(selected, "fontStyle");
  if (fontStyle==="") fontStyle = "none";
  if (selected===page) {
    $('#fontStyle option[value=""]').text(`none`);
    $('#fontStyle option[value=none]').hide();
  } else {
    let parentFontStyle = displayAttribute("fontStyle", getInheritedAttribute(selected.parent, "fontStyle"));
    if (parentFontStyle==="") parentFontStyle = "none";
    $('#fontStyle option[value=""]').text(`Inherited: ${parentFontStyle}`);
    $('#fontStyle option[value=none]').show();
  }
  if (selected.fontStyle)
    $('#fontStyle').val(selected.fontStyle);
  else
    $('#fontStyle').val("");

  let fontWidth = getInheritedAttribute(selected, "fontWidth");
  if (fontWidth==="") fontWidth = "none";
  if (selected===page)
    $('#fontWidth option[value=""]').text(`none`);
  else {
    let parentFontWidth = displayAttribute("fontWidth", getInheritedAttribute(selected.parent, "fontWidth"));
    $('#fontWidth option[value=""]').text(`Inherited: ${parentFontWidth}`);
  }
  if (selected.fontWidth)
    $('#fontWidth').val(selected.fontWidth);
  else
    $('#fontWidth').val("");

  let fontSize = getInheritedAttribute(selected, "fontSize");
  if (fontSize==="")
    fontSize = "none";
  else
    fontSizeLabel = fontSizeMap[fontSize];
  if (selected===page)
    $('#fontSize option[value=""]').text(`none`);
  else {
    let parentFontSize = displayAttribute("fontSize", getInheritedAttribute(selected.parent, "fontSize"));
    $('#fontSize option[value=""]').text(`Inherited: ${parentFontSize}`);
  }
  if (selected.fontSize)
    $('#fontSize').val(selected.fontSize);
  else
    $('#fontSize').val("");

  if (selected.layoutTag)
    $('#layoutTag').val(selected.layoutTag);
  else
    $('#layoutTag').val("");

  if (selected.structureTag)
    $('#structureTag').val(selected.structureTag);
  else
    $('#structureTag').val("");

  if ((selected.name==="textBlock" || selected.name==="illustration") && selected.parent!==page) {
    $('#ungroup').show();
  } else {
    $('#ungroup').hide();
  }
}

function saveProperty(property) {
  console.log(`Saving property: ${property.id} for ${selected.name} to ${$(property).val()}`);
  if (property.id==="elementLang") {
    let oldLeftToRight = isLeftToRight(selected);
    if ($(property).val()=="" && selected!==page) {
      delete selected.language;
    } else {
      selected.language = $(property).val();
      checkIfPropertyRequired(selected, "language", $(property).val());
    }
    let newLeftToRight = isLeftToRight(selected);
    if (oldLeftToRight != newLeftToRight) {
      sortDescendents(selected);
      setText();
    }
  }

  if (property.id==="fontFamily") {
    if ($(property).val()=="") {
      delete selected.fontFamily;
      delete selected.fontType;
      delete selected.fontStyle;
      delete selected.fontWidth;
      $('#fontType').val("");
      $('#fontStyle').val("");
      $('#fontWidth').val("");
    } else {
      selected.fontFamily = $(property).val();
      checkIfPropertyRequired(selected, "fontFamily", $(property).val());
      let font = fontFamilyMap[$(property).val()];
      if (font.fontType) {
        $('#fontType').val(font.fontType);
        selected.fontType = font.fontType;
        checkIfPropertyRequired(selected, "fontType", font.fontType);
      }
      if (font.fontStyle) {
        $('#fontStyle').val(font.fontStyle);
        selected.fontStyle = font.fontStyle;
        checkIfPropertyRequired(selected, "fontStyle", font.fontStyle);
      }
      if (font.fontWidth) {
        $('#fontWidth').val(font.fontWidth);
        selected.fontWidth = font.fontWidth;
        checkIfPropertyRequired(selected, "fontWidth", font.fontWidth);
      }
    }
  }

  if (property.id==="fontType") {
    if ($(property).val()=="") {
      delete selected.fontType;
    } else {
      selected.fontType = $(property).val();
      checkIfPropertyRequired(selected, "fontType", $(property).val());
    }
  }

  if (property.id==="fontWidth") {
    if ($(property).val()=="") {
      delete selected.fontWidth;
    } else {
      selected.fontWidth = $(property).val();
      checkIfPropertyRequired(selected, "fontWidth", $(property).val());
    }
  }

  if (property.id==="fontStyle") {
    if ($(property).val()=="") {
      delete selected.fontStyle;
    } else {
      selected.fontStyle = $(property).val();
      checkIfPropertyRequired(selected, "fontStyle", $(property).val());
    }
  }

  if (property.id==="fontSize") {
    if ($(property).val()=="") {
      delete selected.fontSize;
    } else {
      selected.fontSize = $(property).val();
      checkIfPropertyRequired(selected, "fontSize", $(property).val());
    }
  }

  if (property.id==="layoutTag") {
    if ($(property).val()=="") {
      delete selected.layoutTag;
    } else {
      selected.layoutTag = $(property).val();
    }
  }

  if (property.id==="structureTag") {
    if ($(property).val()=="") {
      delete selected.structureTag;
    } else {
      selected.structureTag = $(property).val();
    }
  }
}

/**
* Remove property from this element's direct children, if they
* have the property and it is superfluous to the parent's.
*/
function checkIfPropertyRequired(element, property, value) {
  if (element.name==="page") {
    for (let i=0; i<element.composedBlocks.length; i++) {
      let composedBlock = element.composedBlocks[i];
      if (composedBlock[property]===value)
        delete composedBlock[property];
    }
    for (let i=0; i<element.textBlocks.length; i++) {
      let textBlock = element.textBlocks[i];
      if (textBlock.parent===element) {
        if (textBlock[property]===value)
          delete textBlock[property];
      }
    }
    for (let i=0; i<element.illustrations.length; i++) {
      let illustration = element.illustrations[i];
      if (illustration.parent===element) {
        if (illustration[property]===value)
          delete illustration[property];
      }
    }
  } else if (element.name==="composedBlock") {
    for (let i=0; i<element.textBlocks.length; i++) {
      let textBlock = element.textBlocks[i];
      if (textBlock[property]===value)
        delete textBlock[property];
    }
    for (let i=0; i<element.illustrations.length; i++) {
      let illustration = element.illustrations[i];
      if (illustration[property]===value)
        delete illustration[property];
    }
  } else if (element.name==="textBlock") {
    for (let i=0; i<element.textLines.length; i++) {
      let textLine = element.textLines[i];
      if (textLine[property]===value)
        delete textLine[property];
    }
  } else if (element.name==="textLine") {
    for (let i=0; i<element.strings.length; i++) {
      let string = element.strings[i];
      if (string[property]===value)
        delete string[property];
    }
  }
}

function resetProperties() {
  loadProperties();
}

function workOnItems(newItemType) {
  let types = ["composedBlock", "illustration", "textBlock", "textLine", "string", "glyph"];
  for (i in types) {
    let type = types[i];
    if (newItemType===type) {
      $(`#${type}Editor`).removeClass("unpushed").addClass("pushed");
      itemType = newItemType;
    } else {
      $(`#${type}Editor`).removeClass("pushed").addClass("unpushed");
    }
  }
  let myObjects = [];
  let yourObjects = [];
  canvas.forEachObject(function(o){
    if (o.name===newItemType) {
      myObjects.push(o);
    } else if (o.name) {
      yourObjects.push(o);
    }
  });
  for (let i=0; i<myObjects.length; i++) {
    let o = myObjects[i];
    if (o.name!=="glyph") {
      o.selectable = true;
      o.evented = true;
    } else {
      o.selectable = false;
      o.evented = false;
    }

    o.bringToFront();
  }
  for (let i=0; i<yourObjects.length; i++) {
    let o = yourObjects[i];
    o.selectable = false;
    o.evented = false;
  }

  canvas.renderAll();
}

let selectionCreatedHandler = function(evt) {
  saveText();
  selected = evt.target;
  loadProperties();
  setText();
}

let selectionUpdatedHandler = function(evt) {
  selectionCreatedHandler(evt);
}

let selectionClearedHandler = function(evt) {
  saveText();
  selected = page;
  loadProperties();
  setText();
}

let beforeTransformHandler = function (evt) {
  let target = canvas.getActiveObject();
  console.log(`before:transform: ${target.id}`);
  target.clone(function(c) {
   originalObject = c;
  });
  originalObject.leftNoZoom = target.leftNoZoom;
  originalObject.topNoZoom = target.topNoZoom;
  originalObject.right = target.right;
  originalObject.bottom = target.bottom;
}

let objectModifiedHandler = function (evt) {
  let target = evt.target;
  console.log(`object:modified: ${target}`);
  if (target.name==="composedBlock") {
    editComposedBlock(target, 2);
  } else if (target.name==="illustration") {
    editIllustration(target, 2);
  } else if (target.name==="textBlock") {
    editTextBlock(target, 2);
  } else if (target.name==="textLine") {
    editTextLine(target, 5);
  } else if (target.name==="string") {
    editString(target, 2);
  }
  setText();
}

let scaleRect;

let objectScalingHandler = function(evt) {
  let o = evt.target;
  o.stroke='rgba(0,0,0,0.0)'
  o.dirty = true;

  if (!scaleRect) {
    scaleRect = new fabric.Rect({
        left: o.left,
        top: o.top,
        originX: 'left',
        originY: 'top',
        width: o.width * o.scaleX,
        height: o.height * o.scaleY,
        scaleX: 1.0,
        scaleY: 1.0,
        angle: 0,
        fill: 'rgba(0,0,255,0.2)',
        stroke: 'black',
        strokeWidth: 1.0,
        transparentCorners: false
    });
    canvas.add(scaleRect);
    canvas.renderAll();
  } else {
    scaleRect.left = o.left;
    scaleRect.top = o.top;
    scaleRect.width = o.width * o.scaleX;
    scaleRect.height = o.height * o.scaleY;
    scaleRect.dirty = true;
    canvas.renderAll();
  }
}

let dragRect, origX, origY;

let mouseDownHandler = function(e) {
  startDrag = e.absolutePointer;

  if ($("#chkAllowAdd").prop("checked") && selected.name==="page" &&
    (itemType==="textBlock"
      || itemType==="illustration"
      || itemType==="composedBlock"
      || itemType==="string")) {
    // show the drag rectangle although we have disabled group select
    let pointer = canvas.getPointer(e.e);
    origX = pointer.x;
    origY = pointer.y;

    dragRect = new fabric.Rect({
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x-origX,
        height: pointer.y-origY,
        angle: 0,
        fill: 'rgba(0,0,255,0.2)',
        transparentCorners: false
    });
    canvas.add(dragRect);
  }

  let location = e.absolutePointer;
  if (itemType==="glyph") {
    switchGlyph(location, 5);
  }
}

let mouseMoveHandler = function(e) {
  if (dragRect) {
    // update the drag rectangle
    let pointer = canvas.getPointer(e.e);
    
    if(origX>pointer.x){
        dragRect.set({ left: Math.abs(pointer.x) });
    }
    if(origY>pointer.y){
        dragRect.set({ top: Math.abs(pointer.y) });
    }
    
    dragRect.set({ width: Math.abs(origX - pointer.x) });
    dragRect.set({ height: Math.abs(origY - pointer.y) });
    
    canvas.renderAll();
  }
}

let mouseUpHandler = function(e) {
  if (dragRect) {
    // remove the drag rectangle
    canvas.remove(dragRect);
    dragRect = null;
  }

  if (scaleRect) {
    // remove the scale rectangle
    canvas.remove(scaleRect);
    scaleRect = null;

    let o = e.target;
    if (o.name==="composedBlock") {
      o.stroke = composedBlockColor;
    } else if (o.name==="illustration") {
      o.stroke = illustrationColor;
    } else if (o.name==="textBlock") {
      o.stroke = textBlockColor;
    } else if (o.name==="textLine") {
      o.stroke = textLineColor;
    } else if (o.name==="string") {
      o.stroke = stringColor;
    } else if (o.name==="glyph") {
      o.stroke = glyphColor;
    }
    o.dirty = true;
  }

  if ($("#chkAllowAdd").prop("checked") && selected.name==="page") {
    let endDrag = e.absolutePointer;
    if (itemType==="composedBlock") {
      addComposedBlock(startDrag, endDrag, 5);
    } else if (itemType==="illustration") {
      addIllustration(startDrag, endDrag, 5);
    } else if (itemType==="textBlock") {
      addTextBlock(startDrag, endDrag, 5);
    } else if (itemType==="textLine") {
      addTextLine(startDrag, 5);
    } else if (itemType==="string") {
      addString(startDrag, endDrag, 5);
    }
    return false;
  }
}

let mouseDblClickHandler = function(e) {
  let location = e.absolutePointer;
  if (itemType==="string") {
    splitString(location, 5);
  }
}

/**
* Add a new composedBlock.
*/
function addComposedBlock(startDrag, endDrag, tolerance) {
  let left = startDrag.x < endDrag.x ? startDrag.x : endDrag.x;
  let top = startDrag.y < endDrag.y ? startDrag.y : endDrag.y;
  let right = startDrag.x < endDrag.x ? endDrag.x : startDrag.x ;
  let bottom = startDrag.y < endDrag.y ? endDrag.y  : startDrag.y;
  let width = startDrag.x < endDrag.x ? endDrag.x - startDrag.x : startDrag.x - endDrag.x;
  let height = startDrag.y < endDrag.y ? endDrag.y - startDrag.y : startDrag.y - endDrag.y;

  if (width<tolerance || height<tolerance)
    return;

  let cb = newComposedBlock(left / zoom, top / zoom, width / zoom, height / zoom);
  cb.right = cb.left + cb.width * zoom;
  cb.bottom = cb.top + cb.height * zoom;

  findComposedBlockChildren(cb, 2);

  canvas.setActiveObject(cb);
  
  resizeComposedBlocks();
  canvas.renderAll();
}

/**
* Edit a composedBlock.
*/
function editComposedBlock(cb, tolerance) {
  let orig = originalObject;
  orig.right = orig.left + orig.width * zoom;
  orig.bottom = orig.top + orig.height * zoom;

  // if it's a rotation, rotate background image and exit
  if (cb.angle!= 0) {
    console.log(`Angle changed to ${cb.angle}`)
    let angle = cb.angle;
    if (angle > 180)
      angle = angle - 360;
    cb.angle = 0;
    cb.top = orig.top;
    cb.left = orig.left;
    rotateImage(0 - angle);
    canvas.renderAll();
    return;
  }

  // first, resize the textblock to the current zoom
  cb.height = cb.height * (cb.scaleY / zoom);
  cb.width = cb.width * (cb.scaleX / zoom);
  cb.topNoZoom = cb.top / zoom;
  cb.leftNoZoom = cb.left / zoom;
  cb.scaleX = zoom;
  cb.scaleY = zoom;
  cb.strokeWidth = composedBlockWidth / zoom;
  cb.setCoords();
  cb.right = cb.left + cb.width * zoom;
  cb.bottom = cb.top + cb.height * zoom;
  cb.dirty = true;

  console.log(`composedBlock id: ${cb.id}`)
  console.log(`composedBlock before: l ${orig.left.toFixed(2)}, t ${orig.top.toFixed(2)}, r ${orig.right.toFixed(2)}, b ${orig.bottom.toFixed(2)}, w ${orig.width.toFixed(2)}, h ${orig.height.toFixed(2)}`);
  console.log(`composedBlock after: ${cb.id} at l ${cb.left.toFixed(2)}, t ${cb.top.toFixed(2)}, r ${cb.right.toFixed(2)}, b ${cb.bottom.toFixed(2)}, w ${cb.width.toFixed(2)}, h ${orig.height.toFixed(2)}`);

  findComposedBlockChildren(cb, tolerance);

  resizeComposedBlocks();
  canvas.renderAll();
}

function findComposedBlockChildren(cb, tolerance) {
 // Find overlapped textblocks
  let overlaps = [];
  for (let i=0; i<page.textBlocks.length; i++) {
    let ol = page.textBlocks[i];
    ol.right = ol.left + ol.width * zoom;
    ol.bottom = ol.top + ol.height * zoom;
    if (cb.right - ol.left < tolerance || ol.right - cb.left < tolerance || cb.bottom - ol.top < tolerance || ol.bottom - cb.top < tolerance) {
     // no intersection
    } else {
      console.log(`Found overlap: ${ol.id}`);
      overlaps.push(ol);
    }
  }

  for (let i=0; i<cb.textBlocks.length; i++) {
    let textBlock = cb.textBlocks[i];
    textBlock.parent = page;
  }
  cb.textBlocks = [];

  for (let i=0; i<overlaps.length; i++) {
    let ol = overlaps[i];
    if (ol.parent!==page) {
      ol.parent.textBlocks = ol.parent.textBlocks.filter(function(item) { return item!=ol; });
    }
    ol.parent = cb;
    cb.textBlocks.push(ol);
  }

  // Find overlapped illustrations
  let olIllustrations = [];
  for (let i=0; i<page.illustrations.length; i++) {
    let ol = page.illustrations[i];
    ol.right = ol.left + ol.width * zoom;
    ol.bottom = ol.top + ol.height * zoom;
    if (cb.right - ol.left < tolerance || ol.right - cb.left < tolerance || cb.bottom - ol.top < tolerance || ol.bottom - cb.top < tolerance) {
     // no intersection
    } else {
      console.log(`Found overlap: ${ol.id}`);
      olIllustrations.push(ol);
    }
  }

  for (let i=0; i<cb.illustrations.length; i++) {
    let illustration = cb.illustrations[i];
    illustration.parent = page;
  }
  cb.illustrations = [];

  for (let i=0; i<olIllustrations.length; i++) {
    let ol = olIllustrations[i];
    if (ol.parent!==page) {
      ol.parent.illustrations = ol.parent.illustrations.filter(function(item) { return item!=ol; });
    }
    ol.parent = cb;
    cb.illustrations.push(ol);
  }

  sortTextBlocks(cb);
  sortIllustrations(cb);
}

/**
* Add a new textBlock.
*/
function addTextBlock(startDrag, endDrag, tolerance) {
  let left = startDrag.x < endDrag.x ? startDrag.x : endDrag.x;
  let top = startDrag.y < endDrag.y ? startDrag.y : endDrag.y;
  let width = startDrag.x < endDrag.x ? endDrag.x - startDrag.x : startDrag.x - endDrag.x;
  let height = startDrag.y < endDrag.y ? endDrag.y - startDrag.y : startDrag.y - endDrag.y;

  if (width>=tolerance && height >= tolerance) {
    let textBlock = newTextBlock(left / zoom, top / zoom, width / zoom, height / zoom);

    textBlock.clone(function(c) {
     originalObject = c;
    });

    editTextBlock(textBlock, 2);

    canvas.setActiveObject(textBlock);
    canvas.renderAll();
  }
}

/**
* Add a new illustration.
*/
function addIllustration(startDrag, endDrag, tolerance) {
  let left = startDrag.x < endDrag.x ? startDrag.x : endDrag.x;
  let top = startDrag.y < endDrag.y ? startDrag.y : endDrag.y;
  let width = startDrag.x < endDrag.x ? endDrag.x - startDrag.x : startDrag.x - endDrag.x;
  let height = startDrag.y < endDrag.y ? endDrag.y - startDrag.y : startDrag.y - endDrag.y;

  if (width>=tolerance && height >= tolerance) {
    let illustration = newIllustration(left / zoom, top / zoom, width / zoom, height / zoom);

    illustration.clone(function(c) {
     originalObject = c;
    });

    canvas.setActiveObject(illustration);
    canvas.renderAll();
  }
}

function editIllustration(illustration, tolerance) {
  let orig = originalObject;
  orig.right = orig.left + orig.width * zoom;
  orig.bottom = orig.top + orig.height * zoom;

  // if it's a rotation, rotate background image and exit
  if (illustration.angle!= 0) {
    console.log(`Angle changed to ${illustration.angle}`)
    let angle = illustration.angle;
    if (angle > 180)
      angle = angle - 360;
    rotateImage(0 - angle);
    illustration.angle = 0;
    illustration.top = orig.top;
    illustration.left = orig.left;
    canvas.renderAll();
    return;
  }

  // first, resize the illustration to the current zoom
  illustration.height = illustration.height * (illustration.scaleY / zoom);
  illustration.width = illustration.width * (illustration.scaleX / zoom);
  illustration.topNoZoom = illustration.top / zoom;
  illustration.leftNoZoom = illustration.left / zoom;
  illustration.scaleX = zoom;
  illustration.scaleY = zoom;
  illustration.strokeWidth = illustrationWidth / zoom;
  illustration.setCoords();
  illustration.right = illustration.left + illustration.width * zoom;
  illustration.bottom = illustration.top + illustration.height * zoom;
  illustration.dirty = true;
  canvas.renderAll();
}

function addTextLine(position, tolerance) {
  let textBlock;
  for (let i=0; i<page.textBlocks.length; i++) {
    let tb = page.textBlocks[i];
    if (tb.left <= position.x && tb.left + tb.width * zoom >= position.x
      && tb.top <= position.y && tb.top + tb.height * zoom >= position.y) {
      textBlock = tb;
      break;
    }
  }

  if (textBlock == null)
    return;

  let accept = true;
  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    if (Math.abs(position.y - textLine.top) <= tolerance) {
      // must not be too close to another textLine
      accept = false;
      break;
    }
  }

  if (accept) {
    let textLine = newTextLine(textBlock, position.y / zoom, 0, 0);

    sortTextLines(textBlock);

    let lineNumber;
    for (let i=0; i<textBlock.textLines.length; i++) {
      let line = textBlock.textLines[i];
      if (line===textLine) {
        lineNumber = i;
        break;
      }
    }

    recalculateStringHeight(textBlock);

    canvas.setActiveObject(textLine);
    canvas.renderAll();
  }
}

function editTextLine(target, tolerance) {
  let orig = originalObject;

  let textBlock = target.parent;

  // either it was moved up or done, or it was extended right or left
  if (Math.abs(orig.scaleX - target.scaleX) < 0.01) {
    // was moved up or down
    let accept = true;
    if (target.top <= textBlock.top || target.top >= textBlock.bottom) {
      // must be inside the textBlock
      accept = false;
    } else {
      for (let i=0; i<textBlock.textLines.length; i++) {
        let textLine = textBlock.textLines[i];
        if (textLine!==target) {
          if (((orig.top <= textLine.top && target.top >= textLine.top)
            || (target.top <= textLine.top && orig.top >= textLine.top))
            && target.right > textLine.left && target.left < textLine.right) {
            // must not cross another textLine, if there is any horizontal overlap
            accept = false;
            break;
          } else if (Math.abs(target.top - textLine.top) <=  maxDiff.textlineMerge
            && target.right > textLine.left && target.left < textLine.right) {
            // must not be too close to another textLine, if there is any horizontal overlap
            accept = false;
            break;
          }
        }
      }
    }
    if (accept) {
      recalculateStringHeight(textBlock);
      target.bottom = target.top;
      target.right = target.left + target.width * zoom;
    } else {
      target.top = orig.top;
      target.setCoords();
      target.dirty = true;
    }
  } else {
    // was extended right or left
    // this is only useful to combine it with other textlines

    // first, resize the textLine to the current zoom
    target.width = target.width * (target.scaleX / zoom);
    target.leftNoZoom = target.left / zoom;
    target.scaleX = zoom;
    target.strokeWidth = textLineWidth / zoom;
    target.setCoords();
    target.right = target.left + target.width * zoom;
    target.dirty = true;

    // check if the line overlaps any other lines
    let overlaps = [];
    for (let i=0; i<textBlock.textLines.length; i++) {
      let textLine = textBlock.textLines[i];
      if (textLine!==target && Math.abs(textLine.top - target.top) <= maxDiff.textlineMerge
        && target.right > textLine.left && target.left < textLine.right) {
        overlaps.push(textLine);
      }
    }
    let stringSet = new Set(target.strings);
    for(let i=0; i<overlaps.length; i++) {
      let textLine = overlaps[i];
      textLine.strings.forEach(function(item) {
        item.parent = target;
        stringSet.add(item);
      });
      canvas.remove(textLine);
      textBlock.textLines = textBlock.textLines.filter(function(item) {return item!=textLine;});
    }
    target.strings = Array.from(stringSet);
    sortStrings(target);

    // merge strings if required
    let prevString;
    let groupsToMerge = [];
    let currentGroup;
    for (let i=0; i<target.strings.length; i++) {
      let string = target.strings[i];
      if (prevString && prevString.right > string.left && prevString.left < string.right) {
        if (!currentGroup) {
          currentGroup = [];
          groupsToMerge.push(currentGroup);
          currentGroup.push(prevString);
        }
        currentGroup.push(string);
      } else {
        currentGroup = null;
      }
      prevString = string;
    }

    for (let i=0; i<groupsToMerge.length; i++) {
      let groupToMerge = groupsToMerge[i];
      let string = groupToMerge[0];
      let glyphSet = new Set(string.glyphs);
      for (let j=1; j<groupToMerge.length; j++) {
        let other = groupToMerge[j];
        other.glyphs.forEach(function(item) {
          item.parent = string;
          glyphSet.add(item);
        });
        target.strings = target.strings.filter(function(item) {return item!=other;});
        canvas.remove(other);
      }
      string.glyphs = Array.from(glyphSet);
      sortGlyphs(string);

      let prevGlyph;
      let glyphsToRemove = [];
      for (let j=0; j<string.glyphs.length; j++) {
        let glyph = string.glyphs[j];
        if (prevGlyph && Math.abs(prevGlyph.left - glyph.left) < maxDiff.glyphMerge) {
          glyphsToRemove.push(prevGlyph);
        }
        prevGlyph = glyph;
      }

      for (let j=0; j<glyphsToRemove.length; j++) {
        let glyph = glyphsToRemove[j];
        string.glyphs = string.glyphs.filter(function(item) {return item!=glyph;});
        canvas.remove(glyph);
      }
    }

    recalculateStringHeight(textBlock);
    resizeTextLine(target);
  }
  canvas.renderAll();
}

function addString(startDrag, endDrag, tolerance) {
  let textBlock;
  for (let i=0; i<page.textBlocks.length; i++) {
    let tb = page.textBlocks[i];
    if (tb.left <= startDrag.x && tb.left + tb.width * zoom >= startDrag.x
      && tb.top <= startDrag.y && tb.top + tb.height * zoom >= startDrag.y) {
      textBlock = tb;
      break;
    }
  }
  if (textBlock == null) {
    for (let i=0; i<page.textBlocks.length; i++) {
      let tb = page.textBlocks[i];
      if (tb.left <= endDrag.x && tb.left + tb.width * zoom >= endDrag.x
        && tb.top <= endDrag.y && tb.top + tb.height * zoom >= endDrag.y) {
        textBlock = tb;
        break;
      }
    }
  }

  if (textBlock == null) {
    return;
  }

  let textLine;
  for (let i=0; i<textBlock.textLines.length; i++) {
    let tl = textBlock.textLines[i];
    if (tl.top >= startDrag.y) {
      textLine = tl;
      break;
    }
  }
  if (textLine == null) {
    for (let i=0; i<textBlock.textLines.length; i++) {
      let tl = textBlock.textLines[i];
      if (tl.top >= endDrag.y) {
        textLine = tl;
        break;
      }
    }
  }
  if (textLine == null)
    return;

  textBlock.right = textBlock.left + textBlock.width * zoom;
  textBlock.bottom = textBlock.top + textBlock.height * zoom;
  let left = startDrag.x < endDrag.x ? startDrag.x : endDrag.x;
  let top = startDrag.y < endDrag.y ? startDrag.y : endDrag.y;
  let right = startDrag.x < endDrag.x ? endDrag.x : startDrag.x;
  let bottom = startDrag.y < endDrag.y ? endDrag.y : startDrag.y;


  if (left < textBlock.left) left = textBlock.left;
  if (right > textBlock.right) right = textBlock.right;
  if (top < textBlock.top) top = textBlock.top;
  if (bottom > textBlock.bottom) bottom = textBlock.bottom;

  let width = right - left;
  let height = bottom - top;

  if (width < tolerance)
    return;

  let string = newString(textLine, left / zoom, width / zoom);

  let stringsToRemove = [];
  for (let i=0; i<textLine.strings.length; i++) {
    let other = textLine.strings[i];
    if (other != string && other.left <= string.left + string.width * zoom && other.left + other.width * zoom >= string.left) {
      stringsToRemove.push(other);
    }
  }

  for (let i=0; i<stringsToRemove.length; i++) {
    let stringToRemove = stringsToRemove[i];
    console.log(`removing ${JSON.stringify(stringToRemove)}`)
    textLine.strings = textLine.strings.filter(function(item) { return item!=stringToRemove; });
    canvas.remove(stringToRemove);
  }

  resizeTextLine(textLine);
  sortStrings(textLine);
  canvas.setActiveObject(string);

  canvas.renderAll();
}

/**
* If string increases in size, it swallows any overlapped strings, even if partially overlapped.
* If reduced, the glyphs outside simply disappear, rather than splitting.
*/
function editString(string, tolerance) {
  let orig = originalObject;

  // first, resize the string to the current zoom
  string.height = string.height * (string.scaleY / zoom);
  string.width = string.width * (string.scaleX / zoom);
  string.topNoZoom = string.top / zoom;
  string.leftNoZoom = string.left / zoom;
  string.scaleX = zoom;
  string.scaleY = zoom;
  string.strokeWidth = stringWidth / zoom;
  string.right = string.left + string.width * zoom;
  string.bottom = string.top + string.height * zoom;

  // ensure the string doesn't extend beyond its containing textBlock
  let textBlock = string.parent.parent;
  if (string.left < textBlock.left) {
    string.left = textBlock.left;
    string.leftNoZoom = textBlock.leftNoZoom;
  }
  if (string.right > textBlock.right) string.right = textBlock.right;
  if (string.top < textBlock.top) {
    string.top = textBlock.top;
    string.topNoZoom = textBlock.topNoZoom;
  }
  if (string.bottom > textBlock.bottom) string.bottom = textBlock.bottom;
  string.width = (string.right - string.left) / zoom;
  string.height = (string.bottom - string.top) / zoom;

  // to simplify things: a string can only be increased or decreased in size in one direction
  let textLine = string.parent;
  let bigger = (string.width > orig.width);
  if (bigger) {
    let leftExtend = (orig.left - string.left) > (string.right - orig.right);
    if (leftExtend) {
      // reset right to the original string right
      string.right = orig.right;
      string.width = (string.right - string.left) / zoom;
    }
    let overlapped = [];
    let oldStrings = [];
    let leftToRight = isLeftToRight(textLine);
    for (let i=0; i<textLine.strings.length; i++) {
      let other = textLine.strings[i];
      if (string.leftNoZoom + string.width >= other.leftNoZoom && string.leftNoZoom <= other.leftNoZoom + other.width) {
        overlapped.push(other);
        if (other != string)
          oldStrings.push(other);
      }
    }
    oldStrings.push(orig);
    oldStrings = sortStringArray(oldStrings, leftToRight);

    let content = "";
    let minLeft = string.leftNoZoom;
    let maxRight = string.leftNoZoom + string.width;
    let glyphs = [];
    let extendLeft = string.left < orig.left;

    for (let i=0; i<overlapped.length; i++) {
      let other = overlapped[i];
      content += other.content;
      glyphs = glyphs.concat(other.glyphs);
      if (other.leftNoZoom < minLeft)
        minLeft = other.leftNoZoom;
      if (other.leftNoZoom + other.width > maxRight)
        maxRight = other.leftNoZoom + other.width;
      if (string != other) {
        textLine.strings = textLine.strings.filter(function(item) {return item!=other;});
        canvas.remove(other);
      }
    }

    // add glyph separators half-way between swallowed strings
    let prevString;
    for (let i=0; i<oldStrings.length; i++) {
      let oldString = oldStrings[i];
      if (prevString) {
        let midPoint = leftToRight ? (prevString.right + oldString.left) / 2 : (prevString.left + oldString.right) / 2;
        console.log(`adding glyph at ${midPoint}`);
        let midGlyph = newGlyph(string, midPoint / zoom);
        glyphs.push(midGlyph);
      }
      prevString = oldString;
    }

    string.leftNoZoom = minLeft;
    string.width = maxRight - minLeft;
    string.left = minLeft * zoom;
    string.content = content;
    string.glyphs = glyphs;
    sortGlyphs(string);
  } else {
    // need to remove glyphs outside of new string
    let glyphsToRemove = [];
    for (let i=0; i<string.glyphs.length; i++) {
      let glyph = string.glyphs[i];
      if (glyph.leftNoZoom <= string.leftNoZoom || glyph.leftNoZoom >= string.leftNoZoom + string.width) {
        glyphsToRemove.push(glyph);
      }
    }
    for (let i=0; i<glyphsToRemove.length; i++) {
      let glyph = glyphsToRemove[i];
      string.glyphs = string.glyphs.filter(function(item) {return item!=glyph;});
      canvas.remove(glyph);
    }
  }
  string.right = string.left + string.width * zoom;
  string.bottom = string.top + string.height * zoom;
  string.dirty = true;
  string.setCoords();

  sortStrings(textLine);
  resizeTextLine(textLine);
  canvas.renderAll();
}

function switchGlyph(position, tolerance) {
  let string = findString(position);
  if (string == null)
    return;

  let closestGlyph = null;
  let closestDistance = Number.MAX_SAFE_INTEGER;
  for (let i=0; i<string.glyphs.length; i++) {
    let glyph = string.glyphs[i];
    let distance = Math.abs(glyph.left - position.x);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestGlyph = glyph;
    }
  }

  if (closestDistance <= tolerance) {
    string.glyphs = string.glyphs.filter(function(item) {return item!=closestGlyph;});
    canvas.remove(closestGlyph);
  } else {
    let glyph = newGlyph(string, position.x / zoom);
    sortGlyphs(string);
  }
  canvas.renderAll();
}


function findString(position) {
  let textBlock;
  for (let i=0; i<page.textBlocks.length; i++) {
    let tb = page.textBlocks[i];
    if (tb.left <= position.x && tb.left + tb.width * zoom >= position.x
      && tb.top <= position.y && tb.top + tb.height * zoom >= position.y) {
      textBlock = tb;
      break;
    }
  }
  if (textBlock == null)
    return null;

  let textLine;
  for (let i=0; i<textBlock.textLines.length; i++) {
    let tl = textBlock.textLines[i];
    if (tl.top >= position.y) {
      textLine = tl;
      break;
    }
  }
  if (textLine == null)
    return null;

  let string;
  for (let i=0; i<textLine.strings.length; i++) {
    let s = textLine.strings[i];
    if (s.left <= position.x && s.left + s.width * zoom >= position.x) {
      string = s;
      break;
    }
  }

  return string;
}

function splitString(position, tolerance) {
  let string = findString(position);
  if (string != null) {
    // decide where to split the string
    let glyphLeft = null;
    let gLeft = 0;
    let glyphRight = null;
    let gRight = Number.MAX_SAFE_INTEGER;
    for (let i=0; i< string.glyphs.length; i++) {
      let glyph = string.glyphs[i];
      if (glyph.left < position.x && glyph.left > gLeft) {
        glyphLeft = glyph;
        gLeft = glyph.left;
      }
      if (glyph.left >= position.x && glyph.left < gRight) {
        glyphRight = glyph;
        gRight = glyph.left;
      }
    }
    if (glyphLeft == null) {
      gLeft = position.x - ((position.x - string.left) / 10);
    }
    if (glyphRight == null) {
      gRight = position.x + (((string.left + string.width * zoom) - position.x) / 10);
    }

    // split string
    console.log(`splitting string ${string.id} at ${string.left.toFixed(2)}, ${string.top.toFixed(2)} with width ${string.width.toFixed(2)}`);
    let textLine = string.parent;

    let stringLeft = newString(
      textLine,
      string.left / zoom,
      gLeft / zoom - string.left / zoom
    );

    let stringRight = newString(
      textLine,
      gRight / zoom,
      (string.left / zoom + string.width) - gRight / zoom
    );

    splitGlyphs(stringLeft, stringRight, string.content, string.glyphs, tolerance);

    textLine.strings = textLine.strings.filter(function(item) {return item!=string;});
    sortStrings(textLine);

    canvas.remove(string);
  }

}
/**
* Assign a string either to the line on the right or to the line on the left.
* If the string overlaps both lines, split it into two strings,
* and assign one split to each line, dividing the glyphs separators accordingly.
* Any glyph separator closer to the split than the provided tolerance will be removed.
*/
function distributeString(string, midPoint, textLineLeft, textLineRight, tolerance) {
  if (string.left + (string.width * zoom) < midPoint) {
    textLineLeft.strings.push(string);
    string.parent = textLineLeft;
  } else if (string.left > midPoint) {
    textLineRight.strings.push(string);
    string.parent = textLineRight;
  } else {
    // split string
    console.log(`splitting string ${string.id} at ${string.left.toFixed(2)}, ${string.top.toFixed(2)} with width ${string.width.toFixed(2)}`);
    let stringLeft = newString(
      textLineLeft,
      string.left / zoom,
      (midPoint / zoom) - (string.left / zoom)
    );

    let stringRight = newString(
      textLineRight,
      textLineRight.left / zoom,
      (string.left / zoom + string.width) - (midPoint / zoom)
    );

    splitGlyphs(stringLeft, stringRight, string.content, string.glyphs, tolerance);

    canvas.remove(string);
  }
}

/**
* Assign each glyph either to the left-hand string, or to the right-hand string.
* If a glyph is closer to the border than the tolerance, it is discarded.
*/
function splitGlyphs(stringLeft, stringRight, content, glyphs, tolerance) {
  for (let k=0; k<glyphs.length; k++) {
    let glyph = glyphs[k];
    if ((stringLeft.left + stringLeft.width * zoom) - glyph.left > tolerance) {
      stringLeft.glyphs.push(glyph);
      glyph.parent = stringLeft;
    } else if (glyph.left - stringRight.left > tolerance) {
      stringRight.glyphs.push(glyph);
      glyph.parent = stringRight;
    } else {
      canvas.remove(glyph);
    }
  }

  let k2 = 0;
  let changedString = false;
  let leftToRight = isLeftToRight(stringLeft);
  let currentString = leftToRight ? stringLeft : stringRight;
  for (let k=0; k<content.length; k++) {
    let c = content.charAt(k);
    if (accents.has(c) && currentString.content.length>0)
      currentString.content += c;
    else {
      currentString.content += c;
      k2++;
    }
    if (!changedString && k2 >= currentString.glyphs.length) {
      currentString = leftToRight ? stringRight : stringLeft;
      changedString = true;
    }
  }

  console.log(`stringLeft ${stringLeft.id} content: ${stringLeft.content}`);
  console.log(`stringRight ${stringRight.id} content: ${stringRight.content}`);
}

function splitTextLine(textLine, midPoint, textBlockLeft, textBlockRight, tolerance) {
  console.log(`splitting textLine ${textLine.id} at ${textLine.left.toFixed(2)} , ${textLine.top.toFixed(2)} with w ${textLine.width.toFixed(2)}`);

  let top = textLine.top / zoom;
  let left = textBlockLeft.left / zoom;
  let middle = textBlockRight.left / zoom;
  let right = textBlockRight.left / zoom  + textBlockRight.width;

  let textLineLeft = newTextLine(textBlockLeft, top, textLine.stringTop, textLine.stringHeight);
  let textLineRight = newTextLine(textBlockRight, top, textLine.stringTop, textLine.stringHeight);

  // distribute strings among left and right lines
  let stringCount = textLine.strings.length;
  for (let j=0; j<stringCount; j++) {
    let string = textLine.strings[j];
    distributeString(string, midPoint, textLineLeft, textLineRight, tolerance);
  }
  resizeTextLine(textLineLeft);
  resizeTextLine(textLineRight);
  canvas.remove(textLine);

  console.log(`textLineLeft ${textLineLeft.id} content: ${textLineLeft.strings.map(x => x.content).join(' ')}`);
  console.log(`textLineRight ${textLineRight.id} content: ${textLineRight.strings.map(x => x.content).join(' ')}`);

  if (stringCount>0) {
    if (textLineLeft.strings.length==0) {
      textBlockLeft.textLines = textBlockLeft.textLines.filter(function(item) {return item!=textLineLeft;});
      canvas.remove(textLineLeft);
      textLineLeft = null;
    }
    if (textLineRight.strings.length==0) {
      textBlockRight.textLines = textBlockRight.textLines.filter(function(item) {return item!=textLineRight;});
      canvas.remove(textLineRight);
      textLineRight = null;
    }
  }

  return [textLineLeft, textLineRight];
}

/**
* Recalculate textline, string and glyph parenthood based on resized text block.
* The tolerance is expressed in zoomed pixels (screen pixels), and represents how much
* of a difference is required for a change to be taken into account.
* Since the corner controls have been disabled, the following are possible during edit:
* - Either the textblock got smaller or bigger
* - This can be in one of four dimensions only: left, top, right, bottom
* During add, it can only get bigger, but will increase vertically and horizontally simultaneousy.
*/
function editTextBlock(tb, tolerance) {
  let orig = originalObject;
  orig.right = orig.left + orig.width * zoom;
  orig.bottom = orig.top + orig.height * zoom;

  // if it's a rotation, rotate background image and exit
  if (tb.angle!= 0) {
    console.log(`Angle changed to ${tb.angle}`)
    let angle = tb.angle;
    if (angle > 180)
      angle = angle - 360;
    tb.angle = 0;
    tb.top = orig.top;
    tb.left = orig.left;
    rotateImage(0 - angle);
    canvas.renderAll();
    return;
  }

  // first, resize the textblock to the current zoom
  tb.height = tb.height * (tb.scaleY / zoom);
  tb.width = tb.width * (tb.scaleX / zoom);
  tb.topNoZoom = tb.top / zoom;
  tb.leftNoZoom = tb.left / zoom;
  tb.scaleX = zoom;
  tb.scaleY = zoom;
  tb.strokeWidth = textBlockWidth / zoom;
  tb.setCoords();
  tb.right = tb.left + tb.width * zoom;
  tb.bottom = tb.top + tb.height * zoom;
  tb.dirty = true;

  console.log(`textBlock id: ${tb.id}`)
  console.log(`textBlock before: l ${orig.left.toFixed(2)}, t ${orig.top.toFixed(2)}, r ${orig.right.toFixed(2)}, b ${orig.bottom.toFixed(2)}, w ${orig.width.toFixed(2)}, h ${orig.height.toFixed(2)}`);
  console.log(`textBlock after: ${tb.id} at l ${tb.left.toFixed(2)}, t ${tb.top.toFixed(2)}, r ${tb.right.toFixed(2)}, b ${tb.bottom.toFixed(2)}, w ${tb.width.toFixed(2)}, h ${orig.height.toFixed(2)}`);

  let modifiedTextBlocks = [];
  let existingTextBlocks = [];
  let newTextBlocks = [];
  modifiedTextBlocks.push(tb);
  existingTextBlocks.push([tb, tb.textLines.length]);

  let smaller = (tb.height * tb.width < orig.height * orig.width);
  console.log(`New textblock smaller? ${smaller}`);

  if (smaller) {
    // TextBlock got smaller. Check if lines/strings/glyphs need to be transferred to a new TextBlock
    let textLinesAbove = [];
    let textLinesBelow = [];
    let textLinesLeft = [];
    let textLinesRight = [];
    console.log(`Looking for lines to transfer`);
    for (let i=0; i<tb.textLines.length; i++) {
      let textLine = tb.textLines[i];
      console.log(`Checking line ${textLine.id} at ${textLine.left.toFixed(2)}, ${textLine.top.toFixed(2)}, w ${textLine.width.toFixed(2)}`);

      if (textLine.top < tb.top) {
        textLinesAbove.push(textLine);
        console.log(`Above: ${textLine.top.toFixed(2)} < ${tb.top.toFixed(2)}`);
      } else if (textLine.top > tb.bottom) {
        textLinesBelow.push(textLine);
        console.log(`Below: ${textLine.top.toFixed(2)} > ${tb.bottom.toFixed(2)}`);
      }
      if (tb.left - orig.left > tolerance ) {
        textLinesLeft.push(textLine);
        console.log(`Left: ${tb.left.toFixed(2)} - ${orig.left.toFixed(2)} > ${tolerance}`);
      }
      if (orig.right - tb.right > tolerance) {
        textLinesRight.push(textLine);
        console.log(`Right: ${orig.right.toFixed(2)} - ${tb.right.toFixed(2)} > ${tolerance}`);
      }
    }

    // above and below are treated separately but identically
    let aboveBelow = [textLinesAbove, textLinesBelow];
    for (let h=0; h<2; h++) {
      let aboveOrBelow = h==0 ? 'above' : 'below';
      let textLinesToTransfer = aboveBelow[h];
      if (textLinesToTransfer.length > 0) {
        console.log(`Adding new textblock ${aboveOrBelow}`)
        // create new TextBlock to contain lines outside
        let textBlockNew = newTextBlock(
            orig.left / zoom,
            h==0 ? orig.top / zoom : orig.top / zoom + tb.height,
            orig.width,
            orig.height - tb.height
          )
        
        modifiedTextBlocks.push(textBlockNew);
        newTextBlocks.push(textBlockNew);
        console.log(`textBlockNew zoomed: left: ${textBlockNew.left.toFixed(2)}, top: ${textBlockNew.top.toFixed(2)}`)

        for (let i=0; i<textLinesToTransfer.length; i++) {
          let textLine = textLinesToTransfer[i];
          tb.textLines = tb.textLines.filter(function(item) {return item!=textLine;});
          textBlockNew.textLines.push(textLine);
          textLine.parent = textBlockNew;
        }
      } // we have lines to transfer above or below
    } // above/below

    let leftRight = [textLinesLeft, textLinesRight];
    for (let h=0; h<2; h++) {
      let leftOrRight = h==0 ? 'left' : 'right';
      let textLinesToTransfer = leftRight[h];
      if (textLinesToTransfer.length > 0) {
        let leftWidth = h==0 ? orig.width - tb.width : tb.width;
        let rightWidth = h==0 ? tb.width : orig.width - tb.width;

        let left1 = orig.left / zoom;
        let left2 = left1 + leftWidth;

        console.log(`Adding new textblock ${leftOrRight}`)
        let textBlockNew = newTextBlock(
            h==0 ? left1 : left2,
            tb.top / zoom,
            h==0 ? leftWidth : rightWidth,
            orig.height
          )

        modifiedTextBlocks.push(textBlockNew);
        newTextBlocks.push(textBlockNew);

        let textBlockLeft = h==0 ? textBlockNew : tb;
        let textBlockRight = h==0 ? tb : textBlockNew;
        let midPoint = h==0 ? tb.left : tb.right;

        for (let i=0; i<textLinesToTransfer.length; i++) {
          let textLine = textLinesToTransfer[i];
          let splitLines = splitTextLine(textLine, midPoint, textBlockLeft, textBlockRight, tolerance);
          tb.textLines = tb.textLines.filter(function(item) { return item!=textLine; });
        }
      }
    }
  } else {
    // textblock got bigger

    // find the overlaps
    let overlaps = [];
    for (let i=0; i<page.textBlocks.length; i++) {
      let ol = page.textBlocks[i];
      ol.right = ol.left + ol.width * zoom;
      ol.bottom = ol.top + ol.height * zoom;
      if (tb==ol || (tb.right - ol.left < tolerance || ol.right - tb.left < tolerance || tb.bottom - ol.top < tolerance || ol.bottom - tb.top < tolerance)) {
        // no intersection
      } else {
        console.log(`Found intersection between ${tb.id} and ${ol.id}`);
        overlaps.push(ol);
        existingTextBlocks.push([ol, ol.textLines.length]);
     }
    }

    let textLinesBeforeMerge = tb.textLines.slice(0);
    let transferredTextLines = [];

    // If textblock got bigger, it eats the strings and glyphs that it overlaps.
    // After eating the strings and glyphs, we recalculate the textline for each textline

    // handle the overlaps
    for (let i=0; i<overlaps.length; i++) {
      let ol = overlaps[i];
      console.log(`overlap ${ol.id}: l ${ol.left.toFixed(2)}, t ${ol.top.toFixed(2)}, r ${ol.right.toFixed(2)}, b ${ol.bottom.toFixed(2)}, w ${ol.width.toFixed(2)}, h ${ol.height.toFixed(2)}`);

      let textLinesToSplit = [];
      for (let j=0; j<ol.textLines.length; j++) {
        let textLine = ol.textLines[j];
        textLine.right = textLine.left + textLine.width * zoom;
        if (tb.top <= textLine.top && tb.bottom >= textLine.top &&
          (tb.right >= textLine.left || tb.left <= textLine.right)) {
            textLinesToSplit.push(textLine);
          }
      }

      for (let j=0; j<textLinesToSplit.length; j++) {
        let textLine = textLinesToSplit[j];

        // need to check the proportion on each side, since this may be a "false" split down the middle
        let leftWidth = tb.left - textLine.left;
        let rightWidth = textLine.right - tb.right;
        let fullWidth = textLine.width * zoom;
        let haveLeft = leftWidth > 0;
        let haveRight = rightWidth > 0;
        if (haveLeft && leftWidth / fullWidth < maxDiff.textLineSplitWidthPercent) {
          haveLeft = false;
        }
        if (haveRight && rightWidth / fullWidth < maxDiff.textLineSplitWidthPercent) {
          haveRight = false;
        }

        if (!haveLeft && !haveRight) {
          // full coverage
          console.log(`${textLine.id}: full coverage, content: ${textLine.strings.map(x => x.content).join(' ')}`);
          tb.textLines.push(textLine);
          textLine.parent = tb;
          ol.textLines = ol.textLines.filter(function(item) {return item!=textLine;});
          transferredTextLines.push(textLine);
        } else if (haveLeft && haveRight) {
          // overlap down the middle, need to do two splits
          console.log(`${textLine.id}: split in the middle, content: ${textLine.strings.map(x => x.content).join(' ')}`);
          let splitLines = splitTextLine(textLine, tb.right, tb, ol, tolerance);

          ol.textLines = ol.textLines.filter(function(item) { return item!=textLine; });
          if (splitLines[1] != null) {
            let splitLines2 = splitTextLine(splitLines[1], tb.left, ol, tb, tolerance);
            ol.textLines = ol.textLines.filter(function(item) { return item!=splitLines[1]; });
            if (splitLines[0]!=null && splitLines2[1]!=null) {
              let mergedLine = mergeLines(tb, splitLines[0], splitLines2[1]);
              transferredTextLines.push(mergedLine);
            }
          } else {
            if (splitLines[0]!=null)
              transferredTextLines.push(splitLines[0]);
          }
        } else if (haveRight) {
          console.log(`${textLine.id}: left half goes to tb, content: ${textLine.strings.map(x => x.content).join(' ')}`);
          let splitLines = splitTextLine(textLine, tb.right, tb, ol, tolerance);
          ol.textLines = ol.textLines.filter(function(item) { return item!=textLine; });
          if (splitLines[0]!=null)
            transferredTextLines.push(splitLines[0]);
        } else {
          console.log(`${textLine.id}: right half goes to tb, content: ${textLine.strings.map(x => x.content).join(' ')}`);
          let splitLines = splitTextLine(textLine, tb.left, ol, tb, tolerance);
          ol.textLines = ol.textLines.filter(function(item) { return item!=textLine; });
          if (splitLines[1]!=null)
            transferredTextLines.push(splitLines[1]);
        }
      }

      // for any new textLines transfered to the current textBlock
      // see if they need to be merged with the block's existing textLines
      // Note: all textLines in the block are assumed to cover the entire width
      // If a TextLine doesn't cover the entire width, we merge it with the nearest textLine which does.
      console.log(`transferredTextLines: ${transferredTextLines.length}`)
      let textLinesToMerge = [];
      for (let j=0; j<transferredTextLines.length; j++) {
        let textLine = transferredTextLines[j];
        if (textLine.top >= orig.top && textLine.top <= orig.bottom) {
          // only merge textLines inside the original object
          textLinesToMerge.push(textLine);
        }
      }
      console.log(`textLinesToMerge: ${textLinesToMerge.length}`)
      if (textLinesToMerge.length>0 && textLinesBeforeMerge.length>0) {
        let bestSolution = bestPairs(textLinesToMerge, textLinesBeforeMerge, function(a, b){ return Math.abs(a.top - b.top)}, 5);
        for (let j=0; j<bestSolution.pairs.length; j++) {
          let pair = bestSolution.pairs[j];
          let lineA = pair[0];
          let lineB = pair[1];
          if (lineB != null && Math.abs(lineA.top - lineB.top) <= maxDiff.textlineMerge) {
            mergeLines(tb, lineA, lineB);
          }
        } // next text line to merge
      } // have text lines to merge

      modifiedTextBlocks.push(ol);
    } // next overlap
  }

  // remove textblocks that had lines before and now don't
  for (let i=0; i<existingTextBlocks.length; i++) {
    let textBlock = existingTextBlocks[i][0];
    let initialTextLines = existingTextBlocks[i][1];
    console.log(`For ${textBlock.id}: lines before ${initialTextLines}, after ${textBlock.textLines.length}`);
    if (initialTextLines > 0 && textBlock.textLines.length==0) {
      canvas.remove(textBlock);
      if (textBlock.parent!==page) {
        textBlock.parent.textBlocks = textBlock.parent.textBlocks.filter(function(item) {return item!=textBlock;});
      }
      page.textBlocks = page.textBlocks.filter(function(item) {return item!=textBlock;});
      console.log(`Removed ${textBlock.id}`);
    }
  }
  // set textline size to full textblock width
  for (let i=0; i<modifiedTextBlocks.length; i++) {
    let textBlock = modifiedTextBlocks[i];
    textBlock.dirty = true;
    textBlock.right = textBlock.left + textBlock.width * zoom;
    textBlock.bottom = textBlock.top + textBlock.height * zoom;
    for (let j=0; j < textBlock.textLines.length; j++) {
      let textLine = textBlock.textLines[j];
      resizeTextLine(textLine);
    }
    sortTextLines(textBlock);
    recalculateStringHeight(textBlock);
    if (textBlock!==tb)
      resizeTextBlock(textBlock);
  }

  for (let i=0; i<newTextBlocks.length; i++) {
    let textBlock = newTextBlocks[i];
    if (textBlock.textLines.length==0) {
      canvas.remove(textBlock);
      if (textBlock.parent!==page) {
        textBlock.parent.textBlocks = textBlock.parent.textBlocks.filter(function(item) {return item!=textBlock;});
      }
      page.textBlocks = page.textBlocks.filter(function(item) {return item!=textBlock;});
      console.log(`Removed ${textBlock.id}`);
    } else if (tb.parent!==page) {
      textBlock.parent = tb.parent;
      tb.parent.textBlocks.push(textBlock);
    }
  }

  tb.right = tb.left + tb.width * zoom;
  tb.bottom = tb.top + tb.height * zoom;

  sortTextBlocks(page);
  if (tb.parent!==page)
    sortTextBlocks(tb.parent);

  resizeComposedBlocks();
  canvas.renderAll();
}

function mergeLines(textBlock, lineA, lineB) {
  console.log(`merging ${lineA.id} with ${lineB.id}`);
  console.log(`lineA ${lineA.id} content: ${lineA.strings.map(x => x.content).join(' ')}`);
  console.log(`lineB ${lineB.id} content: ${lineB.strings.map(x => x.content).join(' ')}`);

  for (let k=0; k<lineA.strings.length; k++) {
    let string = lineA.strings[k];
    string.parent = lineB;
    lineB.strings.push(string);
  }
  lineB.textBlock = textBlock;
  textBlock.textLines = textBlock.textLines.filter(function(item) {return item!=lineA;});
  sortStrings(lineB);
  resizeTextLine(lineB);

  canvas.remove(lineA);

  console.log(`merged line ${lineB.id} content: ${lineB.strings.map(x => x.content).join(' ')}`);
  return lineB;
}

/**
* For each item in listA, match one item in listB,
* attempting to minimize the total distance between pairs.
* Complexity is reduced by limiting the search to a beam width.
* Returns a solution where solution.pairs is an array of arrays containing the pairs to match,
* and solution.score is the total distance.
*/
function bestPairs(listA, listB, compare, beam) {
  // if each line has a clear best match, the same solution will be returned multiple times
  // if however two lines A are competing for the same line B, only one can win it in each solution
  let result = allPairs(listA, listB, compare);
  let lists = result.lists;
  let maxDistance = result.maxDistance;
  let empty = {};
  empty.pairs = [];
  empty.score = 0;
  empty.keys = new Set([]);
  empty.matches = new Set([]);
  let solutions = [empty];
  // will need one pair for each item in listA
  for (let i=0; i<lists.length; i++) {
    let newSolutions = [];
    for (let j=0; j<beam; j++) {
      if (j>=solutions.length)
        break;
      let solution = solutions[j];
      for (let k=0; k<lists.length; k++) {
        let list = lists[k];
        if (!solution.keys.has(list[0][0].id)) {
          let foundPair = false;
          for (let l=0; l<list.length; l++) {
            let pair = list[l];
            if (!solution.matches.has(pair[1].id)) {
              let newSolution = {};
              newSolution.pairs = solution.pairs.slice(0);
              newSolution.pairs.push(pair);
              newSolution.score = solution.score + pair[2];
              newSolution.keys = new Set(solution.keys);
              newSolution.keys.add(pair[0].id);
              newSolution.matches = new Set(solution.matches);
              newSolution.matches.add(pair[1].id);
              newSolutions.push(newSolution);
              foundPair = true;
              break;
            }
            // if no pair was found, add an empty match 
            // with distance > max distance
            if (!foundPair) {
              let newSolution = {};
              newSolution.pairs = solution.pairs.slice(0);
              newSolution.pairs.push([list[0][0], null, maxDistance+1]);
              newSolution.score = solution.score + maxDistance+1;
              newSolution.keys = new Set(solution.keys);
              newSolution.keys.add(list[0][0].id);
              newSolution.matches = new Set(solution.matches);
              newSolutions.push(newSolution);
            }
          }
        }
      }
    }
    solutions = newSolutions;
    solutions.sort(function(a, b){ return a.score - b.score});
  }
  return solutions[0];
}

/**
* For each item in listA, return the partners from listB,
* ordered by increasing distance.
*/
function allPairs(listA, listB, compare) {
  let lists = [];
  let maxDistance = 0;
  for (let i=0; i<listA.length; i++) {
    let itemA = listA[i];
    let list = []
    for (let j=0; j<listB.length; j++) {
      let itemB = listB[j];
      let distance = compare(itemA, itemB);
      list.push([itemA, itemB, distance]);
      if (distance>maxDistance)
        maxDistance = distance;
    }
    list.sort(function(a, b){return a[2] - b[2]});
    lists.push(list);
  }
  let result = {};
  result.lists = lists;
  result.maxDistance = maxDistance;
  return result;
}

/**
Unlike other deletes, we simply assigned the contained textBlocks back to the page level
*/
function deleteComposedBlock(composedBlock) {
  for (let i=0; i<composedBlock.textBlocks.length; i++) {
    let textBlock = composedBlock.textBlocks[i];
    if (composedBlock.language!=null && textBlock.language==null)
      textBlock.language = composedBlock.language;
    if (composedBlock.fontFamily!=null && textBlock.fontFamily==null)
      textBlock.fontFamily = composedBlock.fontFamily;
    if (composedBlock.fontStyle!=null && textBlock.fontStyle==null)
      textBlock.fontStyle = composedBlock.fontStyle;
    if (composedBlock.fontWidth!=null && textBlock.fontWidth==null)
      textBlock.fontWidth = composedBlock.fontWidth;
    if (composedBlock.fontSize!=null && textBlock.fontSize==null)
      textBlock.fontSize = composedBlock.fontSize;
    if (composedBlock.fontType!=null && textBlock.fontType==null)
      textBlock.fontType = composedBlock.fontType;
    textBlock.parent = page;
  }
  canvas.remove(composedBlock);
}

function deleteTextBlock(textBlock) {
  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    deleteTextLine(textLine);
  }
  canvas.remove(textBlock);
}

function deleteTextLine(textLine) {
  for (let i=0; i<textLine.strings.length; i++) {
    let string = textLine.strings[i];
    deleteString(string);
  }
  canvas.remove(textLine);
}

function deleteString(string) {
  for (let i=0; i<string.glyphs.length; i++) {
    let glyph = string.glyphs[i];
    deleteGlyph(glyph);
  }
  canvas.remove(string);
}

function deleteGlyph(glyph) {
  canvas.remove(glyph);
}

function deleteSelected() {
  let deleted = selected;
  if (deleted.name!=="page") {
    if (deleted.name==="composedBlock") {
      deleteComposedBlock(deleted);
      page.composedBlocks = page.composedBlocks.filter(function(item) {return item!=deleted;});
    } else if (deleted.name==="textBlock") {
      deleteTextBlock(deleted);
      page.textBlocks = page.textBlocks.filter(function(item) {return item!=deleted;});
    } else if (deleted.name==="textLine") {
      let textBlock = deleted.parent;
      deleteTextLine(deleted);
      textBlock.textLines = textBlock.textLines.filter(function(item) {return item!=deleted;});
      recalculateStringHeight(textBlock);
    } else if (deleted.name==="string") {
      let textLine = deleted.parent;
      deleteString(deleted);
      textLine.strings = textLine.strings.filter(function(item) {return item!=deleted;});
      resizeTextLine(textLine);
    } else if (deleted.name==="glyph") {
      let string = deleted.parent;
      deleteGlyph(deleted);
      string.glyphs = string.glyphs.filter(function(item) {return item!=deleted;});
    }
    canvas.renderAll();
    buildFullContent();
  }
}

function ungroupSelected() {
  if (selected.name==="textBlock" && selected.parent!==page) {
    let composedBlock = selected.parent;
    if (composedBlock.language!=null && selected.language==null)
      selected.language = composedBlock.language;
    if (composedBlock.fontFamily!=null && selected.fontFamily==null)
      selected.fontFamily = composedBlock.fontFamily;
    if (composedBlock.fontStyle!=null && selected.fontStyle==null)
      selected.fontStyle = composedBlock.fontStyle;
    if (composedBlock.fontWidth!=null && selected.fontWidth==null)
      selected.fontWidth = composedBlock.fontWidth;
    if (composedBlock.fontSize!=null && selected.fontSize==null)
      selected.fontSize = composedBlock.fontSize;
    if (composedBlock.fontType!=null && selected.fontType==null)
      selected.fontType = composedBlock.fontType;
    composedBlock.textBlocks = composedBlock.textBlocks.filter(function(item) { return item!=selected; });
    selected.parent = page;
    sortTextBlocks(page);
    resizeComposedBlocks();
  } else if (selected.name==="illustration" && selected.parent!==page) {
    let composedBlock = selected.parent;
    composedBlock.illustrations = composedBlock.illustrations.filter(function(item) { return item!=selected; });
    selected.parent = page;
    sortIllustrations(page);
    resizeComposedBlocks();
  }
}

function extendStrings() {
  let extendBy = Number($('#extendBy').val());
  let extendBorder = $('#extendBorder').val();
  this.extendElement(page, extendBorder, extendBy);
  canvas.renderAll();
}

function extendElement(element, extendBorder, extendBy) {
  if (extendBorder==='Left') {
    element.left -= extendBy * zoom;
    element.leftNoZoom -= extendBy;
  } else {
    element.right += extendBy * zoom;
  }
  element.width += extendBy;
  element.dirty = true;

  if (element.name==='page') {
    let page = element;
    for (let i=0; i<page.composedBlocks.length; i++) {
      let composedBlock = page.composedBlocks[i];
      extendElement(composedBlock, extendBorder, extendBy);
    }
    for (let i=0; i<page.textBlocks.length; i++) {
      let textBlock = page.textBlocks[i];
      if (textBlock.parent===page)
        extendElement(textBlock, extendBorder, extendBy);
    }
    for (let i=0; i<page.illustrations.length; i++) {
      let illustration = page.illustrations[i];
      if (illustration.parent===page)
        extendElement(illustration, extendBorder, extendBy);
    }
  } else if (element.name==='composedBlock') {
    let composedBlock = element;
    for (let i=0; i<composedBlock.textBlocks.length; i++) {
      let textBlock = composedBlock.textBlocks[i];
      extendElement(textBlock, extendBorder, extendBy);
    }
    for (let i=0; i<composedBlock.illustrations.length; i++) {
      let illustration = composedBlock.illustrations[i];
      extendElement(illustration, extendBorder, extendBy);
    }
  } else if (element.name==='textBlock') {
    let textBlock = element;
    for (let i=0; i<textBlock.textLines.length; i++) {
      let textLine = textBlock.textLines[i];
      extendElement(textLine, extendBorder, extendBy);
    }
  } else if (element.name==='textLine') {
    let textLine = element;
    for (let i=0; i<textLine.strings.length; i++) {
      let string = textLine.strings[i];
      extendElement(string, extendBorder, extendBy);
    }
  }
}

