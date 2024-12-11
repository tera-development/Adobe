const TEMPLATE_TEXT_WIDTH_WITH_SCALE = "TemplateTextWidthWithScale";
const TEMPLATE_TEXT_HEIGHT_WITH_SCALE = "TemplateTextHeightWithScale";
const TEMPLATE_POS_X = "TemplatePosX";
const TEMPLATE_POS_Y = "TemplatePosY";
const TEMPLATE_DIFF_X_FROM_CENTER = "TemplateDiffXFromCenter";
const TEMPLATE_DIFF_Y_FROM_CENTER = "TemplateDiffYFromCenter";
const SOURCE_TEXT_LAYER_NAME = "TEXT";

//テキストレイヤのleftとtopから中心座標を計算（グローバル座標）
const layer = thisComp.layer(SOURCE_TEXT_LAYER_NAME);
const rect = layer.sourceRectAtTime();
const left = rect.left;
const top = rect.top;
const width = rect.width;
const height = rect.height;
const glt = layer.toComp([left, top]);
const widthWithScale = width * layer.scale.value[0] / 100;
const heightWithScale = height * layer.scale.value[1] / 100;
const gMiddleX = glt[0] + widthWithScale / 2;
const gMiddleY = glt[1] + heightWithScale / 2;

//TemplateレイヤとCurrentレイヤのスケールの比率をRectを比較して計算
const scaleXRatio = widthWithScale / TEMPLATE_TEXT_WIDTH_WITH_SCALE;
const scaleYRatio = heightWithScale / TEMPLATE_TEXT_HEIGHT_WITH_SCALE;

//ポジション計算
const xDiffFromMiddle = TEMPLATE_DIFF_X_FROM_CENTER * scaleXRatio;
const yDiffFromMiddle = TEMPLATE_DIFF_Y_FROM_CENTER * scaleYRatio;
const x = gMiddleX + xDiffFromMiddle;
const y = gMiddleY + yDiffFromMiddle;

[x, y]