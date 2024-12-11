// ソーステキストレイヤのスケールに合わせてポジションを変更するエクスプレッションを追加

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";
import { CommonDef, ScalePosition } from "./ExpressionFile";

class AddScalePositionExpression {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const sourceTextLayer = this.extractSourceTextLayer(acriveComp.layers);
        const trfVal = Common.getLayerTransformValue(sourceTextLayer);
        this.addScalePositionExpression(
            acriveComp.selectedLayers,
            trfVal.rectWithScale
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
                return layer;
            }
        }
    }

    /**
     * ポジションを設定できるプロパティにエクスプレッションを適用
     * スケールの比較ではテキストを打った時のRectの変化に対応できないので、Rectを比較してスケールの比を計算する
     * @param i_layers
     * @param i_sourceTextRectWithScale
     */
    private addScalePositionExpression(
        i_layers: Layer[],
        i_sourceTextRectWithScale: Rect
    ) {
        i_layers.forEach((layer) => {
            const rect = Common.getGrobalCoordinateRect(layer);

            layer.selectedProperties.forEach((property) => {
                if (property instanceof PropertyGroup) return;

                const value = property.value;
                if (!Array.isArray(value)) return;
                if (value.length < 2) return;

                //手動で設定した値
                const posX = value[0] as number;
                const posY = value[1] as number;

                //rectの中心からの距離の差
                const templateDiffX = posX - (rect.left + rect.width / 2);
                const templateDiffY = posY - (rect.top + rect.height / 2);

                let expression = Common.loadExpression(ScalePosition.FILE_PATH);
                expression = expression.replace(
                    ScalePosition.TEXT_WIDTH_WITH_SCALE,
                    i_sourceTextRectWithScale.width.toString()
                );
                expression = expression.replace(
                    ScalePosition.TEXT_HEIGHT_WITH_SCALE,
                    i_sourceTextRectWithScale.height.toString()
                );
                expression = expression.replace(
                    ScalePosition.POS_X,
                    posX.toString()
                );
                expression = expression.replace(
                    ScalePosition.POS_Y,
                    posY.toString()
                );
                expression = expression.replace(
                    ScalePosition.DIFF_X_FROM_CENTER,
                    templateDiffX.toString()
                );
                expression = expression.replace(
                    ScalePosition.DIFF_Y_FROM_CENTER,
                    templateDiffY.toString()
                );

                property.expression = expression;
            });
        });
    }
}

const addScalePositionExpression = new AddScalePositionExpression();
app.beginUndoGroup(addScalePositionExpression.scriptName);
addScalePositionExpression.main();
app.endUndoGroup();
