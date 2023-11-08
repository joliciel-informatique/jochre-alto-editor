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
// Functions for exporting the modified canvas back to Alto.
// ===========================================================
function downloadString(text, fileType, fileName) {
  let blob = new Blob([text], { type: fileType });

  let a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
}

function canvasToAlto(canvas, altoXml, pageElement) {
  // calculate coordinates of surrounding blocks using strings
  let psTop = Number.MAX_SAFE_INTEGER;
  let psLeft = Number.MAX_SAFE_INTEGER;
  let psBot = 0;
  let psRight = 0;
  for (let i in page.textBlocks) {
    let textBlock = page.textBlocks[i];
    let tbTop = Number.MAX_SAFE_INTEGER;
    let tbLeft = Number.MAX_SAFE_INTEGER;
    let tbBot = 0;
    let tbRight = 0;
    if (textBlock.textLines.length==0) {
      tbTop = textBlock.top / zoom;
      tbLeft = textBlock.left / zoom;
      let tbTopLeft = rotate(tbLeft, tbTop, 0-rotation);
      tbBot =tbTop + textBlock.height;
      tbRight = tbLeft + textBlock.width;
      let tbBotRight = rotate(tbRight, tbBot, 0-rotation);
      tbTop = Math.round(tbTopLeft.y);
      tbLeft = Math.round(tbTopLeft.x);
      tbBot = Math.round(tbBotRight.y);
      tbRight = Math.round(tbBotRight.x);
    } else {
      for (let j in textBlock.textLines) {
        let textLine = textBlock.textLines[j];
        let tlTop = Number.MAX_SAFE_INTEGER;
        let tlLeft = Number.MAX_SAFE_INTEGER;
        let tlBot = 0;
        let tlRight = 0;
        if (textLine.strings.length==0) {
          tlTop = textLine.top / zoom;
          tlLeft = textLine.left / zoom;
          let tlTopLeft = rotate(tlLeft, tlTop, 0-rotation);
          tlBot = tlTop;
          tlRight = tlLeft + textLine.width;
          let tlBotRight = rotate(tlRight, tlBot, 0-rotation);
          tlTop = Math.round(tlTopLeft.y);
          tlLeft = Math.round(tlTopLeft.x);
          tlBot = tlTop;
          tlRight = Math.round(tlBotRight.x);
        } else {
          for (let k in textLine.strings) {
            let string = textLine.strings[k];
            let sTop = string.top / zoom;
            let sLeft = string.left / zoom;
            let sTopLeft = rotate(sLeft, sTop, 0-rotation);
            sTop = Math.round(sTopLeft.y);
            sLeft = Math.round(sTopLeft.x);
            let sRight = string.right / zoom;
            let sBot = string.bottom / zoom;
            let sBotRight = rotate(sRight, sBot, 0-rotation);
            sRight = Math.round(sBotRight.x);
            sBot = Math.round(sBotRight.y);
            for (let m in string.glyphs) {
              let glyph = string.glyphs[m];
              let gTop = glyph.top / zoom;
              let gLeft = glyph.left / zoom;
              let gRotated = rotate(gLeft, gTop, 0-rotation);
              glyph.altoTop = Math.round(gRotated.y);
              glyph.altoLeft = Math.round(gRotated.x);
            }
            string.altoTop = sTop;
            string.altoLeft = sLeft;
            string.altoHeight = sBot - sTop;
            string.altoWidth = sRight - sLeft;
            if (sTop < tlTop) tlTop = sTop;
            if (sLeft < tlLeft) tlLeft = sLeft;
            if (sBot > tlBot) tlBot = sBot;
            if (sRight > tlRight) tlRight = sRight;
          }
        }
        textLine.altoTop = tlTop;
        textLine.altoLeft = tlLeft;
        textLine.altoHeight = tlBot - tlTop;
        textLine.altoWidth = tlRight - tlLeft;
        let blRotated1 = rotate(textLine.left / zoom, textLine.top / zoom, 0-rotation);
        let blRotated2 = rotate(textLine.right / zoom, textLine.top / zoom, 0-rotation);
        textLine.altoBaseLine = [Math.round(blRotated1.x), Math.round(blRotated1.y), Math.round(blRotated2.x), Math.round(blRotated2.y)]

        if (tlTop < tbTop) tbTop = tlTop;
        if (tlLeft < tbLeft) tbLeft = tlLeft;
        if (tlBot > tbBot) tbBot = tlBot;
        if (tlRight > tbRight) tbRight = tlRight;
      }
    }
    textBlock.altoTop = tbTop;
    textBlock.altoLeft = tbLeft;
    textBlock.altoHeight = tbBot - tbTop;
    textBlock.altoWidth = tbRight - tbLeft;
    if (tbTop < psTop) psTop = tbTop;
    if (tbLeft < psLeft) psLeft = tbLeft;
    if (tbBot > psBot) psBot = tbBot;
    if (tbRight > psRight) psRight = tbRight;
  }

  for (let i in page.illustrations) {
    let illustration = page.illustrations[i];
    let iTop = illustration.top / zoom;
    let iLeft = illustration.left / zoom;
    let iTopLeft = rotate(iLeft, iTop, 0-rotation);
    let iBottom =iTop + illustration.height;
    let iRight = iLeft + illustration.width;
    let iBotRight = rotate(iRight, iBottom, 0-rotation);
    illustration.altoTop = Math.round(iTopLeft.y);
    illustration.altoLeft = Math.round(iTopLeft.x);
    illustration.altoHeight = Math.round(iBotRight.y - iTopLeft.y);
    illustration.altoWidth = Math.round(iBotRight.x - iTopLeft.x);
  }

  for (let i in page.graphicalElements) {
    let graphicalElement = page.graphicalElements[i];
    let iTop = graphicalElement.top / zoom;
    let iLeft = graphicalElement.left / zoom;
    let iTopLeft = rotate(iLeft, iTop, 0-rotation);
    let iBottom =iTop + graphicalElement.height;
    let iRight = iLeft + graphicalElement.width;
    let iBotRight = rotate(iRight, iBottom, 0-rotation);
    graphicalElement.altoTop = Math.round(iTopLeft.y);
    graphicalElement.altoLeft = Math.round(iTopLeft.x);
    graphicalElement.altoHeight = Math.round(iBotRight.y - iTopLeft.y);
    graphicalElement.altoWidth = Math.round(iBotRight.x - iTopLeft.x);
  }

  // calculate coordinates for composed blocks last
  // their contained textblocks were already calculated
  for (let i in page.composedBlocks) {
    let composedBlock = page.composedBlocks[i];
    let cbTop = Number.MAX_SAFE_INTEGER;
    let cbLeft = Number.MAX_SAFE_INTEGER;
    let cbBot = 0;
    let cbRight = 0;

    for (let j in composedBlock.textBlocks) {
      let textBlock = composedBlock.textBlocks[j];
      if (textBlock.altoTop < cbTop) cbTop = textBlock.altoTop;
      if (textBlock.altoLeft < cbLeft) cbLeft = textBlock.altoLeft;
      if (textBlock.altoTop + textBlock.altoHeight > cbBot) cbBot = textBlock.altoTop + textBlock.altoHeight;
      if (textBlock.altoLeft + textBlock.altoWidth > cbRight) cbRight = textBlock.altoLeft + textBlock.altoWidth;
    }

    for (let j in composedBlock.illustrations) {
      let illustration = composedBlock.illustrations[j];
      if (illustration.altoTop < cbTop) cbTop = illustration.altoTop;
      if (illustration.altoLeft < cbLeft) cbLeft = illustration.altoLeft;
      if (illustration.altoTop + illustration.altoHeight > cbBot) cbBot = illustration.altoTop + illustration.altoHeight;
      if (illustration.altoLeft + illustration.altoWidth > cbRight) cbRight = illustration.altoLeft + illustration.altoWidth;
    }

    for (let j in composedBlock.graphicalElements) {
      let graphicalElement = composedBlock.graphicalElements[j];
      if (graphicalElement.altoTop < cbTop) cbTop = graphicalElement.altoTop;
      if (graphicalElement.altoLeft < cbLeft) cbLeft = graphicalElement.altoLeft;
      if (graphicalElement.altoTop + graphicalElement.altoHeight > cbBot) cbBot = graphicalElement.altoTop + graphicalElement.altoHeight;
      if (graphicalElement.altoLeft + graphicalElement.altoWidth > cbRight) cbRight = graphicalElement.altoLeft + graphicalElement.altoWidth;
    }

    composedBlock.altoTop = cbTop;
    composedBlock.altoLeft = cbLeft;
    composedBlock.altoHeight = cbBot - cbTop;
    composedBlock.altoWidth = cbRight - cbLeft;
  }

  // add any required reference elements
  let altoElement = altoXml.documentElement;
  let nameSpaceURI = altoElement.namespaceURI;

  let layoutElements = altoXml.getElementsByTagName("Layout");
  let layoutElement;
  if (layoutElements.length > 0) {
    layoutElement = altoXml.getElementsByTagName("Layout")[0];
  } else {
    layoutElement = altoXml.createElementNS(nameSpaceURI, "Layout");
    altoElement.appendChild(layoutElement);
  }

  if ($('#chkCurrentPageOnly').prop('checked')) {
    // remove all existing pages if required
    while (layoutElement.firstChild) {
      layoutElement.removeChild(layoutElement.firstChild);
    }
    layoutElement.appendChild(pageElement);
  }

  // add all required styles
  let stylesElements = altoXml.getElementsByTagName("Styles");
  let stylesElement;
  if (stylesElements.length>0) {
    stylesElement = stylesElements[0];
  } else {
    stylesElement = altoXml.createElementNS(nameSpaceURI, "Styles");
    altoElement.appendChild(stylesElement);
  }

  let styleIds = {}
  let fontKeyStyleMap = {}
  let nextId = 1;
  for (let j=0; j<stylesElement.children.length; j++) {
    let child = stylesElement.children[j];
    if (child.tagName==="TextStyle") {
      let fontKey = [
        child.hasAttribute("FONTFAMILY") ? child.getAttribute("FONTFAMILY") : "",
        child.hasAttribute("FONTTYPE") ? child.getAttribute("FONTTYPE") : "",
        child.hasAttribute("FONTSTYLE") ? child.getAttribute("FONTSTYLE") : "",
        child.hasAttribute("FONTWIDTH") ? child.getAttribute("FONTWIDTH") : "",
        child.hasAttribute("FONTSIZE") ? child.getAttribute("FONTSIZE") : "",
      ].join("|");
      styleIds[child.id] = fontKey;
      fontKeyStyleMap[fontKey] = child.id;
      let idDigits  = child.id.replace(/\D/g,'');
      if (idDigits.length>0) {
        let num = Number(idDigits);
        if (num>=nextId)
          nextId = num+1;
      }
    }
  }

  // Find the styles actually used on this page
  let usedStyles = new Set();
  for (let i=0; i<page.composedBlocks.length; i++) {
    let composedBlock = page.composedBlocks[i];
    let fontKey = getFontKey(composedBlock);
    usedStyles.add(fontKey);
  }
  for (let i=0; i<page.textBlocks.length; i++) {
    let textBlock = page.textBlocks[i];
    let fontKey = getFontKey(textBlock);
    usedStyles.add(fontKey);
    for (let j=0; j<textBlock.textLines.length; j++) {
      let textLine = textBlock.textLines[j];
      if (textLine.fontFamily || textLine.fontType || textLine.fontStyle || textLine.fontWidth || textLine.fontSize) {
        let fontKey = getFontKey(textLine);
        usedStyles.add(fontKey);
      }
      for (let k=0; k<textLine.strings.length; k++) {
        let string = textLine.strings[k];
        if (string.fontFamily || string.fontType || string.fontStyle || string.fontWidth || string.fontSize) {
          let fontKey = getFontKey(string);
          usedStyles.add(fontKey);
        }
      }
    }
  }
  usedStyles.forEach(function(key) {
    if (fontKeyStyleMap[key]==null) {
      let styleElement = altoXml.createElementNS(nameSpaceURI, "TextStyle");
      styleElement.id = `Font-${nextId}`;
      nextId++;
      fontKeyStyleMap[key] = styleElement.id;

      let fontElements = key.split("|");
      if (fontElements[0].length>0)
        styleElement.setAttribute("FONTFAMILY", fontElements[0]);
      if (fontElements[1].length>0)
        styleElement.setAttribute("FONTTYPE", fontElements[1]);
      if (fontElements[2].length>0)
        styleElement.setAttribute("FONTSTYLE", fontElements[2]);
      if (fontElements[3].length>0)
        styleElement.setAttribute("FONTWIDTH", fontElements[3]);
      if (fontElements[4].length>0)
        styleElement.setAttribute("FONTSIZE", fontElements[4]);
      stylesElement.appendChild(styleElement);
    }
  });

  // add all required tags
  let tagsElements = altoXml.getElementsByTagName("Tags");
  let tagsElement;
  if (tagsElements.length>0) {
    tagsElement = tagsElements[0];
  } else {
    tagsElement = altoXml.createElementNS(nameSpaceURI, "Tags");
    altoElement.appendChild(tagsElement);
  }

  // Add layout tags
  for (let i=0;i<layoutTags.length;i++){
    let layoutTag = layoutTags[i];
    let layoutTagId = `Layout-${layoutTag[0]}`
    let foundTag = false;
    for (let j=0; j<tagsElement.children.length; j++) {
      let child = tagsElement.children[j];
      if (child.tagName==="LayoutTag" && child.id===layoutTagId) {
        foundTag = true;
        break;
      }
    }
    if (!foundTag) {
      let layoutTagElement = altoXml.createElementNS(nameSpaceURI, "LayoutTag");
      layoutTagElement.id = layoutTagId;
      layoutTagElement.setAttribute("LABEL", layoutTag[0]);
      tagsElement.appendChild(layoutTagElement);
    }
  }

  // Add structure tags
  for (let i=0;i<allStructureTags.length;i++){
    let structureTag = allStructureTags[i];
    let structureTagId = `Struct-${structureTag[0]}`
    let foundTag = false;
    for (let j=0; j<tagsElement.children.length; j++) {
      let child = tagsElement.children[j];
      if (child.tagName==="StructureTag" && child.id===structureTagId) {
        foundTag = true;
        break;
      }
    }
    if (!foundTag) {
      let structureTagElement = altoXml.createElementNS(nameSpaceURI, "StructureTag");
      structureTagElement.id = structureTagId;
      structureTagElement.setAttribute("LABEL", structureTag[0]);
      tagsElement.appendChild(structureTagElement);
    }
  }

  // remove existing children from Page
  while (pageElement.firstChild) {
      pageElement.removeChild(pageElement.firstChild);
  }

  // generate the alto
  pageElement.setAttribute("ROTATION", `${rotation.toFixed(2)}`);
  pageElement.setAttribute("LANG", getInheritedAttribute(page, "language"));

  let printSpaceTag = altoXml.createElementNS(nameSpaceURI, "PrintSpace");
  pageElement.appendChild(printSpaceTag);
  printSpaceTag.setAttribute("VPOS", `${Math.round(psTop)}`);
  printSpaceTag.setAttribute("HPOS", `${Math.round(psLeft)}`);
  printSpaceTag.setAttribute("HEIGHT", `${Math.round(psBot - psTop)}`);
  printSpaceTag.setAttribute("WIDTH", `${Math.round(psRight - psLeft)}`);

  let pageNumber = pageElement.getAttribute("PHYSICAL_IMG_NR");

  let composedBlockNumber = 1;
  let textBlockNumber = 1;
  let illustrationNumber = 1;
  let graphicalElementNumber = 1;
  let pageNumberStr = pageNumber.padStart(5, "0");

  let textBlockTags = {};

  // determine export order
  let blocks = [];
  let currentComposedBlock;
  for (let i=0; i<page.textBlocks.length; i++) {
    let textBlock = page.textBlocks[i];
    if (textBlock.parent===page)
      blocks.push(textBlock);
    else if (currentComposedBlock!==textBlock.parent) {
      currentComposedBlock = textBlock.parent;
      blocks.push(currentComposedBlock);
    }
  }

  for (let i=0; i<page.composedBlocks.length; i++) {
    let composedBlock = page.composedBlocks[i];
    if (composedBlock.textBlocks.length===0)
      blocks.push(composedBlock);
  }

  for (let i=0; i<blocks.length; i++) {
    let block = blocks[i];
    if (block.name==="composedBlock") {
      let composedBlock = block;
      let cbId = `${composedBlockNumber}`.padStart(3, "0");
      let composedBlockTag = altoXml.createElementNS(nameSpaceURI, "ComposedBlock");
      composedBlockTag.setAttribute("ID", `CB_${pageNumberStr}_${cbId}`);
      composedBlockTag.setAttribute("VPOS", `${composedBlock.altoTop}`);
      composedBlockTag.setAttribute("HPOS", `${composedBlock.altoLeft}`);
      composedBlockTag.setAttribute("HEIGHT", `${composedBlock.altoHeight}`);
      composedBlockTag.setAttribute("WIDTH", `${composedBlock.altoWidth}`);
      //composedBlockTag.setAttribute("ROTATION", `${rotation.toFixed(2)}`);
      if (composedBlock.language!=null) {
        composedBlockTag.setAttribute("LANG", getInheritedAttribute(composedBlock, "language"));
      }
      let fontKey = getFontKey(composedBlock);
      let styleRef = fontKeyStyleMap[fontKey];
      composedBlockTag.setAttribute("STYLEREFS", styleRef);
      let tagRefs = getTagRefs(composedBlock);
      if (tagRefs!=="")
        composedBlockTag.setAttribute("TAGREFS", tagRefs);
      printSpaceTag.appendChild(composedBlockTag);
      
      for (let j in composedBlock.textBlocks) {
        let textBlock = composedBlock.textBlocks[j];
        let textBlockTag = this.exportTextBlock(textBlock, composedBlockTag, pageNumber, textBlockNumber, nameSpaceURI, fontKeyStyleMap);
        textBlockTags[textBlock.id] = textBlockTag;
        textBlockNumber++;
      }

      for (let j in composedBlock.illustrations) {
        let illustration = composedBlock.illustrations[j];
        let illustrationTag = this.exportIllustration(illustration, composedBlockTag, pageNumber, illustrationNumber, nameSpaceURI);
        illustrationNumber++;
      }

      for (let j in composedBlock.graphicalElements) {
        let graphicalElement = composedBlock.graphicalElements[j];
        let graphicalElementTag = this.exportGraphicalElement(graphicalElement, composedBlockTag, pageNumber, graphicalElementNumber, nameSpaceURI);
        graphicalElementNumber++;
      }

      composedBlockNumber++;
    } else {
      let textBlock = block;
      let textBlockTag = this.exportTextBlock(textBlock, printSpaceTag, pageNumber, textBlockNumber, nameSpaceURI, fontKeyStyleMap);
      textBlockTags[textBlock.id] = textBlockTag;
      textBlockNumber++;
    }
  }

  for (let j in page.illustrations) {
    let illustration = page.illustrations[j];
    if (illustration.parent===page) {
      let illustrationTag = this.exportIllustration(illustration, printSpaceTag, pageNumber, illustrationNumber, nameSpaceURI);
      illustrationNumber++;
    }
  }

  for (let j in page.graphicalElements) {
    let graphicalElement = page.graphicalElements[j];
    if (graphicalElement.parent===page) {
      let graphicalElementTag = this.exportGraphicalElement(graphicalElement, printSpaceTag, pageNumber, graphicalElementNumber, nameSpaceURI);
      graphicalElementNumber++;
    }
  }

  let prevTag;
  for (let i in page.textBlocks) {
    let textBlock = page.textBlocks[i];
    let textBlockTag = textBlockTags[textBlock.id];
    if (prevTag!=null) {
      let tagId = textBlockTag.getAttribute("ID");
      prevTag.setAttribute("IDNEXT", tagId);
    }
    prevTag = textBlockTag;
  }

  let xmlSerializer = new XMLSerializer();
  let altoString = xmlSerializer.serializeToString(altoXml);
  return vkbeautify.xml(altoString , 2);
}

function getFontKey(element) {
  let style = getInheritedAttribute(element, "fontStyle");
  if (style==='none') style = '';
  let fontKey = [
    getInheritedAttribute(element, "fontFamily"),
    getInheritedAttribute(element, "fontType"),
    style,
    getInheritedAttribute(element, "fontWidth"),
    getInheritedAttribute(element, "fontSize"),
  ].join("|");
  return fontKey;
}

function getTagRefs(element) {
  let tagRefs = "";
  if (element.layoutTag!=null && element.structureTag!=null)
    tagRefs = `Layout-${element.layoutTag} Struct-${element.structureTag}`;
  else if (element.layoutTag!=null)
    tagRefs = `Layout-${element.layoutTag}`;
  else if (element.structureTag!=null)
    tagRefs = `Struct-${element.structureTag}`;
  return tagRefs;
}

function exportTextBlock(textBlock, parent, pageNumber, textBlockNumber, nameSpaceURI, fontKeyStyleMap) {
  let pageNumberStr = pageNumber.padStart(5, "0");

  let tbId = `${textBlockNumber}`.padStart(3, "0");
  let textBlockTag = altoXml.createElementNS(nameSpaceURI, "TextBlock");
  textBlockTag.setAttribute("ID", `TB_${pageNumberStr}_${tbId}`);
  textBlockTag.setAttribute("VPOS", `${textBlock.altoTop}`);
  textBlockTag.setAttribute("HPOS", `${textBlock.altoLeft}`);
  textBlockTag.setAttribute("HEIGHT", `${textBlock.altoHeight}`);
  textBlockTag.setAttribute("WIDTH", `${textBlock.altoWidth}`);
  //textBlockTag.setAttribute("ROTATION", `${rotation.toFixed(2)}`);
  if (textBlock.language!=null)
    textBlockTag.setAttribute("LANG", getInheritedAttribute(textBlock, "language"));
  if (textBlock.parent===page || textBlock.fontFamily || textBlock.fontType || textBlock.fontStyle || textBlock.fontWidth || textBlock.fontSize) {
    let fontKey = getFontKey(textBlock);
    let styleRef = fontKeyStyleMap[fontKey];
    textBlockTag.setAttribute("STYLEREFS", styleRef);
  }
  let tagRefs = getTagRefs(textBlock);
  if (tagRefs!=="")
    textBlockTag.setAttribute("TAGREFS", tagRefs);

  parent.appendChild(textBlockTag);
 
  for (let j in textBlock.textLines) {
    let textLine = textBlock.textLines[j];
    let textLineTag = altoXml.createElementNS(nameSpaceURI, "TextLine");
    textLineTag.setAttribute("VPOS", `${textLine.altoTop}`);
    textLineTag.setAttribute("HPOS", `${textLine.altoLeft}`);
    textLineTag.setAttribute("HEIGHT", `${textLine.altoHeight}`);
    textLineTag.setAttribute("WIDTH", `${textLine.altoWidth}`);
    let baseLineText = `${textLine.altoBaseLine[0]},${textLine.altoBaseLine[1]} ${textLine.altoBaseLine[2]},${textLine.altoBaseLine[3]}`
    textLineTag.setAttribute("BASELINE", baseLineText);
    if (textLine.language!=null)
      textLineTag.setAttribute("LANG", textLine.language);
    if (textLine.fontFamily || textLine.fontType || textLine.fontStyle || textLine.fontWidth || textLine.fontSize) {
      let fontKey = getFontKey(textLine);
      let styleRef = fontKeyStyleMap[fontKey];
      textLineTag.setAttribute("STYLEREFS", styleRef);
    }
    let tagRefs = getTagRefs(textLine);
    if (tagRefs!=="")
      textLineTag.setAttribute("TAGREFS", tagRefs);
    textBlockTag.appendChild(textLineTag);

    let prevString = null;
    let lineLeftToRight = isLeftToRight(textLine);
    for (let k in textLine.strings) {
      let string = textLine.strings[k];
      if (prevString!=null) {
        let spaceTag = altoXml.createElementNS(nameSpaceURI, "SP");
        spaceTag.setAttribute("VPOS", `${string.altoTop}`);
        spaceTag.setAttribute("HEIGHT", `${string.altoHeight}`);
        if (lineLeftToRight) {
          let spaceLeft = prevString.altoLeft + prevString.altoWidth;
          let spaceWidth = string.altoLeft - spaceLeft;
          spaceTag.setAttribute("HPOS", `${spaceLeft}`);
          spaceTag.setAttribute("WIDTH", `${spaceWidth}`);
        } else {
          let spaceLeft = string.altoLeft + string.altoWidth;
          let spaceWidth = prevString.altoLeft - spaceLeft;
          spaceTag.setAttribute("HPOS", `${spaceLeft}`);
          spaceTag.setAttribute("WIDTH", `${spaceWidth}`);
        }
        textLineTag.appendChild(spaceTag);
      }
      let stringTag = altoXml.createElementNS(nameSpaceURI, "String");
      stringTag.setAttribute("VPOS", `${string.altoTop}`);
      stringTag.setAttribute("HPOS", `${string.altoLeft}`);
      stringTag.setAttribute("HEIGHT", `${string.altoHeight}`);
      stringTag.setAttribute("WIDTH", `${string.altoWidth}`);
      stringTag.setAttribute("WC", "1.0");
      stringTag.setAttribute("CONTENT", string.content);
      if (string.language!=null)
        stringTag.setAttribute("LANG", string.language);
      if (string.fontFamily || string.fontType || string.fontStyle || string.fontWidth || string.fontSize) {
        let fontKey = getFontKey(string);
        let styleRef = fontKeyStyleMap[fontKey];
        stringTag.setAttribute("STYLEREFS", styleRef);
      }
      let tagRefs = getTagRefs(string);
      if (tagRefs!=="")
        stringTag.setAttribute("TAGREFS", tagRefs);
      textLineTag.appendChild(stringTag);

      let chars = [];
      for (let l=0; l<string.content.length; l++) {
        let c = string.content.charAt(l);
        if (accents.has(c) && chars.length>0)
          chars.push(chars.pop() + c);
        else
          chars.push(c);
      }

      let l = 0;
      let prevX = 0;
      let leftToRight = isLeftToRight(string);
      if (leftToRight)
        prevX = string.altoLeft;
      else
        prevX = string.altoLeft + string.altoWidth;

      for (let m in string.glyphs) {
        let glyph = string.glyphs[m];
        let content = "";
        if (l<chars.length)
          content = chars[l];
        let width = Math.abs(prevX - glyph.altoLeft);

        let glyphTag = altoXml.createElementNS(nameSpaceURI, "Glyph");
        glyphTag.setAttribute("VPOS", `${glyph.altoTop}`);
        if (leftToRight)
          glyphTag.setAttribute("HPOS", `${prevX}`);
        else
          glyphTag.setAttribute("HPOS", `${glyph.altoLeft}`);
        glyphTag.setAttribute("HEIGHT", `${string.altoHeight}`);
        glyphTag.setAttribute("WIDTH", `${width}`);
        glyphTag.setAttribute("GC", "1.0");
        glyphTag.setAttribute("CONTENT", content);
        stringTag.appendChild(glyphTag);

        prevX = glyph.altoLeft;
        l++;
      }

      let content = "";
      if (l<chars.length)
        content = chars[l];
      let nextX = leftToRight ? string.altoLeft + string.altoWidth : string.altoLeft;
      let width = Math.abs(prevX - nextX);
      let glyphTag = altoXml.createElementNS(nameSpaceURI, "Glyph");
      glyphTag.setAttribute("VPOS", `${string.altoTop}`);
      if (leftToRight)
        glyphTag.setAttribute("HPOS", `${prevX}`);
      else
        glyphTag.setAttribute("HPOS", `${nextX}`);
      glyphTag.setAttribute("HEIGHT", `${string.altoHeight}`);
      glyphTag.setAttribute("WIDTH", `${width}`);
      glyphTag.setAttribute("GC", "1.0");
      glyphTag.setAttribute("CONTENT", content);

      stringTag.appendChild(glyphTag);

      prevString = string;
    }
  }
  return textBlockTag;
}

function exportIllustration(illustration, parent, pageNumber, illustrationNumber, nameSpaceURI) {
  let pageNumberStr = pageNumber.padStart(5, "0");
  let ilId = `${illustrationNumber}`.padStart(3, "0");
  let illustrationTag = altoXml.createElementNS(nameSpaceURI, "Illustration");
  illustrationTag.setAttribute("ID", `IL_${pageNumberStr}_${ilId}`);
  illustrationTag.setAttribute("VPOS", `${illustration.altoTop}`);
  illustrationTag.setAttribute("HPOS", `${illustration.altoLeft}`);
  illustrationTag.setAttribute("HEIGHT", `${illustration.altoHeight}`);
  illustrationTag.setAttribute("WIDTH", `${illustration.altoWidth}`);
  illustrationTag.setAttribute("ROTATION", `${rotation.toFixed(2)}`);
  let tagRefs = getTagRefs(illustration);
  if (tagRefs!=="")
    illustrationTag.setAttribute("TAGREFS", tagRefs);

  parent.appendChild(illustrationTag);
}

function exportGraphicalElement(graphicalElement, parent, pageNumber, graphicalElementNumber, nameSpaceURI) {
  let pageNumberStr = pageNumber.padStart(5, "0");
  let ilId = `${graphicalElementNumber}`.padStart(3, "0");
  let graphicalElementTag = altoXml.createElementNS(nameSpaceURI, "GraphicalElement");
  graphicalElementTag.setAttribute("ID", `GE_${pageNumberStr}_${ilId}`);
  graphicalElementTag.setAttribute("VPOS", `${graphicalElement.altoTop}`);
  graphicalElementTag.setAttribute("HPOS", `${graphicalElement.altoLeft}`);
  graphicalElementTag.setAttribute("HEIGHT", `${graphicalElement.altoHeight}`);
  graphicalElementTag.setAttribute("WIDTH", `${graphicalElement.altoWidth}`);
  graphicalElementTag.setAttribute("ROTATION", `${rotation.toFixed(2)}`);
  let tagRefs = getTagRefs(graphicalElement);
  if (tagRefs!=="")
    graphicalElementTag.setAttribute("TAGREFS", tagRefs);

  parent.appendChild(graphicalElementTag);
}

function exportAlto() {
  let alto = canvasToAlto(canvas, altoXml, pageElement);
  downloadString(alto, 'xml', altoFileName);
}