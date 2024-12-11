// エクスプレッションファイルとスクリプトファイルをつなぐ定義集

export class CommonDef {
    static readonly TEXT_TEMPLATE_FOLDER = "TextTemplate";
    static readonly SOURCE_TEXT_LAYER_NAME = "TEXT";
    static readonly SOURCE_COMP_PREFIX = "TXT_";
}

export class MillorText {
    static readonly FILE_NAME = "MillorText.js";
    static readonly COMP_NAME = "ReferenceText";
    static readonly LAYER_NAME = "RefText";
}

export class ScalePixel {
    static readonly FILE_PATH = CommonDef.TEXT_TEMPLATE_FOLDER + "\\ScalePixelSize.js";

    //expressionファイルに記載されている情報（後で置換する用）
    static readonly TEXT_SCALE_X = "\"TemplateTextScaleX\"";
    static readonly TEXT_SCALE_Y = "\"TemplateTextScaleY\"";
    static readonly PIXEL_SIZE = "\"TemplatePixelSize\"";
}

export class ScalePosition {
    static readonly FILE_PATH = CommonDef.TEXT_TEMPLATE_FOLDER + "\\ScalePosition.js";

    //expressionファイルに記載されている情報（後で置換する用）
    static readonly TEXT_WIDTH_WITH_SCALE = "\"TemplateTextWidthWithScale\"";
    static readonly TEXT_HEIGHT_WITH_SCALE = "\"TemplateTextHeightWithScale\"";
    static readonly POS_X = "\"TemplatePosX\"";
    static readonly POS_Y = "\"TemplatePosY\"";
    static readonly DIFF_X_FROM_CENTER = "\"TemplateDiffXFromCenter\"";
    static readonly DIFF_Y_FROM_CENTER = "\"TemplateDiffYFromCenter\"";
}

export class MillorLayer {
    static readonly MILLOR_TEMPLATE_FILE_PATH = CommonDef.TEXT_TEMPLATE_FOLDER + "\\MillorTemplateLayer.js";
    static readonly MILLOR_SOURCE_FILE_PATH = CommonDef.TEXT_TEMPLATE_FOLDER + "\\MillorSourceLayer.js";

    //expressionファイルに記載されている情報（後で置換する用）
    static readonly COMP_NAME = "SourceCompName";
    static readonly LAYER_ID = "\"LayerId\"";
}