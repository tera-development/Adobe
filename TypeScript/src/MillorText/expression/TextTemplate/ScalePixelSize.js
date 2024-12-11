const TEMPLATE_TEXT_SCALE_X = "TemplateTextScaleX";
const TEMPLATE_TEXT_SCALE_Y = "TemplateTextScaleY";
const TEMPLATE_PIXEL_SIZE = "TemplatePixelSize";
const SOURCE_TEXT_LAYER_NAME = "TEXT";

//TemplateレイヤとCurrentレイヤのスケールの比率
const layer = thisComp.layer(SOURCE_TEXT_LAYER_NAME);
const scale = layer.scale;
const scaleX = scale[0];
const scaleY = scale[0];
const scaleXRatio = scaleX / TEMPLATE_TEXT_SCALE_X;
const scaleYRatio = scaleY / TEMPLATE_TEXT_SCALE_Y;
const scaleRatio = Math.min(scaleXRatio, scaleYRatio);

TEMPLATE_PIXEL_SIZE * scaleRatio;