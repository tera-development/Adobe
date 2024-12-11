// ソーステキストレイヤのスケールに合わせてピクセルサイズを変更するエクスプレッションを追加

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";
import { CommonDef, ScalePixel } from "./ExpressionFile";

class AddScalePixelExpression {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const sourceTextLayer = this.extractSourceTextLayer(acriveComp.layers);
        const sourceTextLayerScale = sourceTextLayer.scale.value;
        this.addScaleExpression(
            acriveComp.selectedLayers,
            sourceTextLayerScale
        );
    }

    /**
     * ソーステキストレイヤを抽出
     * @param i_layers
     * @returns
     */
    private extractSourceTextLayer(i_layers: LayerCollection) {
        for (let l = 1; l <= i_layers.length; l++) {
            const layer = i_layers[l];
            if (layer.name == CommonDef.SOURCE_TEXT_LAYER_NAME) {
                return layer as TextLayer;
            }
        }
    }

    /**
     * ピクセルサイズを設定できるプロパティにエクスプレッションを適用
     * @param i_layers
     * @param i_sourceTextLayerScale
     */
    private addScaleExpression(
        i_layers: Layer[],
        i_sourceTextLayerScale: ThreeDPoint
    ) {
        i_layers.forEach((layer) => {
            layer.selectedProperties.forEach((property) => {
                if (property instanceof PropertyGroup) return;

                const value = property.value;
                if (isNaN(value)) return;

                let expression = Common.loadExpression(ScalePixel.FILE_PATH);
                expression = expression.replace(
                    ScalePixel.TEXT_SCALE_X,
                    i_sourceTextLayerScale[0].toString()
                );
                expression = expression.replace(
                    ScalePixel.TEXT_SCALE_Y,
                    i_sourceTextLayerScale[1].toString()
                );
                expression = expression.replace(
                    ScalePixel.PIXEL_SIZE,
                    value.toString()
                );

                property.expression = expression;
            });
        });
    }
}

const addScalePixelExpression = new AddScalePixelExpression();
app.beginUndoGroup(addScalePixelExpression.scriptName);
addScalePixelExpression.main();
app.endUndoGroup();
