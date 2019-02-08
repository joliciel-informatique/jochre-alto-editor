// ===========================================================
// Functions for modifying the text in the loaded Alto canvas.
// ===========================================================
function buildStringSpan(string, text) {
  let chars = [];
  for (let i=0; i<text.length; i++) {
    let c = text.charAt(i);
    if (accents.has(c) && chars.length>0)
      chars.push(chars.pop() + c);
    else
      chars.push(c);
  }
  let numGlyphs = string.glyphs.length+1; // glyphs are actually separators between glyphs

  if (chars.length==numGlyphs)
    return text;
  else if (numGlyphs < chars.length)
    return chars.slice(0, numGlyphs).join("") + `<span class="error">${chars.slice(numGlyphs).join("")}</span>`;
  else
    return text + `<span class="error">${missingGlyph.repeat(numGlyphs - chars.length)}</span>`;
}

function buildTextLineSpan(textLine, text) {
  let words = text.split(" ").filter(i => i); // filters out empty strings in case of double spaces
  let span = "";
  for (let i=0; i<textLine.strings.length; i++) {
    let string = textLine.strings[i];
    if (words.length > i) {
      span += `<span>${buildStringSpan(string, words[i])}</span> `;
    } else {
      let numGlyphs = string.glyphs.length+1; // glyphs are actually separators between glyphs
      span += `<span class="error">${missingGlyph.repeat(numGlyphs)}</span> `;
    }
  }
  for (let i=textLine.strings.length; i<words.length; i++) {
    span += `<span class="error">${words[i]}</span> `;
  }
  return span;
}

function buildTextBlockSpan(textBlock, text) {
  let rows = text.split("\n");
  let span = "";
  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    if (rows.length > i) {
      span += `${buildTextLineSpan(textLine, rows[i])}<br/>`;
    } else {
      span += `${buildTextLineSpan(textLine, "")}<br/>`;
    }
  }
  for (let i=textBlock.textLines.length; i<rows.length; i++) {
    span += `<span class="error">${rows[i]}</span><br/>`;
  }
  return span;
}

function buildComposedBlockSpan(composedBlock, text) {
  let pars = text.split("\n\n");
  let span = "";
  for (let i=0; i<composedBlock.textBlocks.length; i++) {
    let textBlock = composedBlock.textBlocks[i];
    if (pars.length > i) {
      span += `${buildTextBlockSpan(textBlock, pars[i])}<br/>`;
    } else {
      span += `${buildTextBlockSpan(textBlock, "")}<br/>`;
    }
  }
  for (let i=composedBlock.textBlocks.length; i<pars.length; i++) {
    span += `<span class="error">${pars[i]}</span><br/>`;
  }
  return span;
}

let elementTextOnKeyUp = function(e, target) {
  if (selected) {
    let text = e.target.value;
    if (selected.name==="string") {
      $(target).html(buildStringSpan(selected, text));
    } else if (selected.name==="textLine") {
      $(target).html(buildTextLineSpan(selected, text));
    } else if (selected.name==="textBlock") {
      $(target).html(buildTextBlockSpan(selected, text));
    } else if (selected.name==="composedBlock") {
      $(target).html(buildComposedBlockSpan(selected, text));
    }
  }
}

function applyStringUpdate(string, text) {
  string.content = text;
}

function applyTextLineUpdate(textLine, text) {
  let words = text.split(" ").filter(i => i); // filters out empty strings in case of double spaces
  for (let i=0; i<textLine.strings.length; i++) {
    let string = textLine.strings[i];
    if (words.length > i) {
      applyStringUpdate(string, words[i]);
    } else {
      applyStringUpdate(string, "");
    }
  }
}

function applyTextBlockUpdate(textBlock, text) {
  let rows = text.split("\n");
  for (let i=0; i<textBlock.textLines.length; i++) {
    let textLine = textBlock.textLines[i];
    if (rows.length > i) {
      applyTextLineUpdate(textLine, rows[i]);
    } else {
      applyTextLineUpdate(textLine, "");
    }
  }
}

function applyComposedBlockUpdate(composedBlock, text) {
  let pars = text.split("\n\n");
  for (let i=0; i<composedBlock.textBlocks.length; i++) {
    let textBlock = composedBlock.textBlocks[i];
    if (pars.length > i) {
      applyTextBlockUpdate(textBlock, pars[i]);
    } else {
      applyTextBlockUpdate(textBlock, "");
    }
  }
}

function saveText() {
  if (selected) {
    let text = $('#elementText').val();
    if (selected.name==="string") {
      applyStringUpdate(selected, text);
    } else if (selected.name==="textLine") {
      applyTextLineUpdate(selected, text);
    } else if (selected.name==="textBlock") {
      applyTextBlockUpdate(selected, text);
    } else if (selected.name==="composedBlock") {
      applyComposedBlockUpdate(selected, text);
    }
  }
}

function setText() {
  if (selected) {
    if (isLeftToRight(selected)) {
      $(`#elementText`).removeClass("rtl");
      $(`#currentContent`).removeClass("rtl");
    } else {
      $(`#elementText`).addClass("rtl");
      $(`#currentContent`).addClass("rtl");
    }
    $("#elementIdForText").text(selected.id);
    if (selected.name==="string") {
      let content = selected.content;
      $('#elementText').val(content);
      $('#currentContent').html(buildStringSpan(selected, content))
    } else if (selected.name==="textLine") {
      let contents = [];
      let haveContent = false;
      for (let i in selected.strings) {
        contents.push(selected.strings[i].content);
        if (selected.strings[i].content.length > 0)
          haveContent = true;
      }
      let content = haveContent ? contents.join(" "): "";
      $('#elementText').val(content);
      $('#currentContent').html(buildTextLineSpan(selected, content))
    } else if (selected.name==="textBlock") {
      let tlContents = [];
      let haveTextLineContent = false;
      for (let i = 0; i<selected.textLines.length; i++) {
        let textLine = selected.textLines[i];
        let contents = [];
        let haveContent = false;
        for (let j = 0; j<textLine.strings.length; j++) {
          contents.push(textLine.strings[j].content);
          if (textLine.strings[j].content.length > 0)
            haveContent = true;
        }
        let tlContent = haveContent ? contents.join(" ") : "";
        tlContents.push(tlContent);
        if (haveContent)
          haveTextLineContent = true;
      }
      let content = haveTextLineContent ? tlContents.join("\n"): "";
      $('#elementText').val(content);
      $('#currentContent').html(buildTextBlockSpan(selected, content))
    } else if (selected.name==="composedBlock") {
      let tbContents = [];
      let haveTextBlockContent = false;
      for (let k=0; k<selected.textBlocks.length; k++) {
        let textBlock = selected.textBlocks[k];
        let tlContents = [];
        let haveTextLineContent = false;
        for (let i = 0; i<textBlock.textLines.length; i++) {
          let textLine = textBlock.textLines[i];
          let contents = [];
          let haveContent = false;
          for (let j = 0; j<textLine.strings.length; j++) {
            contents.push(textLine.strings[j].content);
            if (textLine.strings[j].content.length > 0)
              haveContent = true;
          }
          let tlContent = haveContent ? contents.join(" ") : "";
          tlContents.push(tlContent);
          if (haveContent)
            haveTextLineContent = true;
        }
        let tbContent = haveTextLineContent ? tlContents.join("\n"): "";
        tbContents.push(tbContent);
        if (haveTextLineContent)
          haveTextBlockContent = true;
      }
      let content = haveTextBlockContent ? tbContents.join("\n\n") : "";
      $('#elementText').val(content);
      $('#currentContent').html(buildComposedBlockSpan(selected, content))
    } else {
      $('#elementText').val("");
      buildFullContent();
    }
  }
}

function buildFullContent() {
  let tbContents = [];
  for (let i=0; i<page.textBlocks.length; i++) {
    let textBlock = page.textBlocks[i];
    let tlContents = [];
    for (let j = 0; j<textBlock.textLines.length; j++) {
      let textLine = textBlock.textLines[j];
      let contents = [];
      for (let k = 0; k<textLine.strings.length; k++) {
        contents.push(textLine.strings[k].content);
      }
      let tlContent = contents.join(" ");
      tlContents.push(tlContent);
    }
    let tbContent = tlContents.join("\n")
    tbContent = buildTextBlockSpan(textBlock, tbContent, false);
    tbContent = tbContent.replace(/\n/g, "<br/>");
    tbContents.push(tbContent);
  }
  let content = tbContents.join("</p><p>");
  content = `<p>${content}</p>`;
  document.getElementById("currentContent").innerHTML = content;
}
