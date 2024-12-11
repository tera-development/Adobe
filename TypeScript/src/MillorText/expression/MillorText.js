const compName = "ReferenceText"; //空文字でthisComp
const layerName = "RefText"; //index - 1で一つ上のレイヤー
//一括
const mText = false;
const mStyle = false;
//個別
const mFontFamily = false;
const mFont = true;
const mFontSize = false;
const mApplyFill = false;
const mFillColor = false;
const mApplyStroke = false;
const mStrokeColor = false;
const mStrokeWidth = false;
const mTracking = false;
const mLeading = false;
const mBold = false;
const mItalic = false;

const refComp = compName == "" ? thisComp : comp(compName);
const refText = refComp.layer(layerName).text.sourceText;
const refStyle = refText.style;
let sStyle = text.sourceText.createStyle();

if (mStyle) {
	sStyle = refStyle;
} else {
	if (mFont) sStyle = sStyle.setFont(refStyle.font);
	if (mFontSize) sStyle = sStyle.setFontSize(refStyle.fontSize);
	if (mApplyFill) sStyle = sStyle.setApplyFill(refStyle.applyFill);
	if (mFillColor) sStyle = sStyle.setFillColor(refStyle.fillColor);
	if (mApplyStroke) sStyle = sStyle.setApplyStroke(refStyle.applyStroke);
	if (mStrokeColor) sStyle = sStyle.setStrokeColor(refStyle.strokeColor);
	if (mStrokeWidth) sStyle = sStyle.setStrokeWidth(refStyle.strokeWidth);
	if (mTracking) sStyle = sStyle.setTracking(refStyle.tracking);
	if (mLeading) sStyle = sStyle.setLeading(refStyle.leading);
	if (mBold) sStyle = sStyle.setFauxBold(refStyle.isFauxBold);
	if (mItalic) sStyle = sStyle.setFauxItalic(refStyle.isFauxItalic);
	if (mFontFamily) {
		//refTextのFontFamily抽出
		const refFont = refStyle.font;
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
			sStyle = sStyle.setFont(refStyle.font);
		} else {
			const newSourceFont = refFontFamily + sourceFontStyle;
			sStyle = sStyle.setFont(newSourceFont);
		}
	}
}

//Styleの後にテキストを書き変えないと書き変わらない
if (mText) sStyle = sStyle.setText(refText);

sStyle;