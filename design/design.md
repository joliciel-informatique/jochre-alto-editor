# Jochre Alto4 Editor design

## Constraints

The Jochre editor applies constraints which are not inherent to Alto4.
* All elements on the page must share the same rotation.
* A ComposedBlock cannot contain other ComposedBlocks.

## Guiding Principles
* Only one type of element may be edited at a time. Thus, the user needs to select the element type before editing.

## Rotation
The Rotation is an angle in degrees, representing the counter-clockwise rotation where 0 is 3 o'clock.
Rotation can only be modified for ComposedBlocks and TextBlocks.

If the Rotation is modified for any single element, all elements in the page will receive the new rotation, pivoted on the page's center point.

Rotation is displayed by rotating the background image, while keeping all rectangles upright, and changing their locations.
This allows us to keep all ALTO elements rectangular and unpivoted, which vastly simplifies editing and calculations.

## ComposedBlocks
ComposedBlocks are represented by a rectangle.

ComposedBlocks may be:
* Deleted, by selecting a ComposedBlock and pushing the Delete button.
* Modified, by using the mouse.
* Added, by clicking the mouse at a start corner, and dragging to the end corner. This is only available if "Allow add" is checked.

If a ComposedBlock is deleted:
* The contained TextBlocks are not deleted - they are simply "ungrouped".

If a ComposedBlock is added or edited:
* Any TextBlocks it overlaps will be grouped into it.
* The ComposedBlock is then resized to the superset of contained TextBlocks.

## TextBlocks
TextBlocks are represented as a rectangle.

TextBlocks may be:
* Deleted, by selecting a TextBlock and pushing the Delete button.
* Modified, by using the mouse. They can only be modified in one direction (horizontal or vertical) at a time.
* Added, by clicking the mouse at a start corner, and dragging to the end corner. This is only available if "Allow add" is checked.
* Ungrouped from the containing ComposedBlock, by clicking on the "Ungroup" button.
* TextBlocks may not be moved.

If a TextBlock is deleted:
* All TextLines inside it are deleted as well

If a TextBlock is modified:
* If the resulting TextBlock A overlaps TextLines from TextBlock B, these overlapping portions of the TextLines are transferred from TextBlock B to TextBlock A, thus generating new TextLines. If the original TextLine had Strings, and one of the splits does not have Strings, the split is deleted. If TextBlock A contains all TextLines from TextBlock B, TextBlock B is deleted.
* If any Strings cross the TextBlock divide, they are split into two separate Strings. Glyph separators very close to the TextBlock divide are removed.

If a TextBlock is added, the same rules apply as when a TextBlock is modified.

## Illustrations
Illustrations are represented as a rectangle.

They can be modified like TextBlocks, but cannot contain TextLines.

## TextLines
TextLines are represented as the base-line of a line of text.
A TextLine is always associated with a TextBlock.
A TextLine with no Strings spans the entire width of the TextBlock.
A TextLine with Strings is as wide as all of its Strings.

TextLines may be:
* Deleted,  selecting a TextLine and pushing the Delete button.
* Moved up or down, by selecting a TextLine, and dragging it up and down with the mouse.
* Added, by clicking anywhere inside an existing TextBlock. A TextLine will be added intersecting the click point. This is only available if "Allow add" is checked.

If a TextLine is deleted:
* All Strings inside it are deleted as well

If a TextLine is moved up or down:
* All Strings are moved together with it.
* It cannot be moved above or below another existing TextLine.
* It cannot be moved too close to another existing TextLine.

If a TextLine is added:
* The Strings of the TextLine just below it are reduced in size.

## Strings
Strings are represented as a rectangle containing the string.
A String is always associated with a TextLine.
Its horizontal extension may not extend beyond the containing TextBlock.
The top of the String is the top of the TextBlock for the first TextLine, and the bottom of the Strings on the previous TextLine for all remaining TextLines.
Its vertical size is fixed to the distance from its TextLine to the TextLine immediately above it.
If the TextLine is the highest one in a TextBlock, its vertical size is considered to be 1.25 times the distance from the TextLine to the TextBlock top.
This results in Strings whose bottom is below the TextLine, such that approximately 25% of the String is below the TextLine and 75% above the TextLine.

Strings may be:
* Deleted, by selecting a String, and pushing the Delete button.
* Extended right or left, by selecting the String, and dragging the edge right or left.
* Added, clicking and dragging the mouse over a horizontal span above an existing TextLine and below another TextLine or the TextBlock top.  This is only available if "Allow add" is checked.
* Split, by double-clicking inside the String.

If a String is deleted, all of the contained Glyphs are deleted as well.

If a String A is added or extended:
* if it overlaps an existing String B even partially, all of String B is combined with String A.

If a String is split:
* The limits of the right and left strings are determined by the two closest Glyph separators to the point that was double-clicked.

## Glyphs
Glyphs are represented by vertical glyph separators inside a String.
The number of Glyphs is therefore equal to the number of glyph separators + 1.

Glyph separators may be:
* Added/removed: by clicking inside a String. If the click is close to an existing Glyph separator, the Glyph separator will be removed. Otherwise it will be added.

## Properties
The properties tab allows you to update the metadata properties of the currently selected element.

Certain properties are inherited from the parent, and ultimately from the page:
* Language
* Font family
* Font type
* Font style
* Font width
* Font size

Other properties are not inherited:
* Structure tag
* Layout tag

Property changes are immediately applied to the currently selected element.

Additional items in the properties menu include:
* Delete: delete the current element - see the design for each element.
* Extend strings: extend right or left borders for all strings by a certain number of real (unzoomed) pixels.
* A list of approximate font sizes at the current zoom and a given DPI.

## Text
The text tab allows you to update the text associated with the currently selected element.

Changes to text are automatically applied as soon as the text box loses focus.

When editing text for TextBlocks, add a carriage return before each TextLine.

when editing text for ComposedBlocks, add two carriage returns before each TextBlock.

Text is stored internally on the String level only, and it is assumed that white space always separates Strings.
Thus, if you have more words in a given line of text than the number of Strings in the corresponding TextLine, the text with no corresponding Strings will be lost.
On the other hand, if a String has the wrong number of Glyphs, the text is not lost - it simply cannot be assigned correctly to the underlying glyphs on export.

In order to help you align text with Strings and Glyphs, a read-only view below the text box shows any text which is not currently aligned.
Letters which cannot be assigned to a String or glyph are underlined, marked in red, and highlighted in yellow (see `error` class in `default.css`).
Missing letters are shown as � (see `missingGlyph` in `config.js`).

You should ensure that a page has no highlighted errors when exporting.

## Loading an image and Alto4 layer

An image can either be loaded directly from a graphical file (preferred method), or extracted from a PDF file (quality not guaranteed).

When loading the Alto layer, if the Alto file selected contains multiple pages, you need to select the page you want to load and click `Load`.

After loading, any missing font families or sizes are added to the drop-downs. Any missing structure or layout tags are added to the drop-downs as well.

The page's default language and font family are automatically set to language and family found on the highest number of text blocks in the page.

The page's rotation is set to the first text block's rotation (on the assumption that all elements on the page share the same rotation).

ComposedBlocks containing other ComposedBlocks will not be loaded correctly: a ComposedBlock can only contain TextBlocks or Illustrations.

## Exporting an image or Alto4 layer

When exporting ALTO, Jochre exports `SP` elements between words. It does not export 'HYP' elements for end-of-line hyphens - these are incorporated in the Strings.

The Export Image button will only work if the image was initially loaded from a PDF file. It allows the user to save the image as a PNG.