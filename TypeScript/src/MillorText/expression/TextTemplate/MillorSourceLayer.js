const compName = "SourceCompName";
const layerName = "TEXT";
const layerId = "LayerId";

//Millor Template
const mFontFamily = false;
const mFont = true;
const mFontSize = true;
const mApplyFill = true;
const mFillColor = true;
const mApplyStroke = true;
const mStrokeColor = true;
const mStrokeWidth = true;

//Millor Source
const mText = true;
const mTracking = true;
const mLeading = true;
const mBold = true;
const mItalic = true;

const templateStyle = comp(compName).layer(layerId).text.sourceText.style;
const refText = thisComp.layer(layerName).text.sourceText;
const sourceStyle = refText.style;
let sStyle = text.sourceText.createStyle();

//Millor Template
if (mFont) sStyle = sStyle.setFont(templateStyle.font);
if (mFontSize) sStyle = sStyle.setFontSize(templateStyle.fontSize);
if (mApplyFill) sStyle = sStyle.setApplyFill(templateStyle.applyFill);
if (mFillColor) sStyle = sStyle.setFillColor(templateStyle.fillColor);
if (mApplyStroke) sStyle = sStyle.setApplyStroke(templateStyle.applyStroke);
if (mStrokeColor) sStyle = sStyle.setStrokeColor(templateStyle.strokeColor);
if (mStrokeWidth) sStyle = sStyle.setStrokeWidth(templateStyle.strokeWidth);
if (mFontFamily) {
	//refTextのFontFamily抽出
	const refFont = templateStyle.font;
	const refSepIdx = refFont.lastIndexOf("-");
	let refFontFamily;
	if (refSepIdx == -1) {
		refFontFamily = refFont;
	} else {
		refFontFamily = refFont.slice(0, refSepIdx);
	}

	//sourceTextのFont抽出
	const sourceFont = text.sourceText.style.font;
	const sourceSepIdx = sourceFont.lastIndexOf("-");
	let sourceFontFamily;
	let sourceFontStyle;
	if (sourceSepIdx == -1) {
		sourceFontFamily = sourceFont;
		sourceFontStyle = "";
	} else {
		sourceFontFamily = sourceFont.slice(0, sourceSepIdx);
		sourceFontStyle = sourceFont.slice(sourceSepIdx, sourceFont.length);
	}

	//FontFamilyが同じ時だけFontStyleを変えられるようにする
	if (refFontFamily != sourceFontFamily) {
		sStyle = sStyle.setFont(templateStyle.font);
	} else {
		const newSourceFont = refFontFamily + sourceFontStyle;
		sStyle = sStyle.setFont(newSourceFont);
	}
}

//Millor Source
if (mTracking) sStyle = sStyle.setTracking(sourceStyle.tracking);
if (mLeading) sStyle = sStyle.setLeading(sourceStyle.leading);
if (mBold) sStyle = sStyle.setFauxBold(sourceStyle.isFauxBold);
if (mItalic) sStyle = sStyle.setFauxItalic(sourceStyle.isFauxItalic);
if (mText) sStyle = sStyle.setText(refText);

sStyle;