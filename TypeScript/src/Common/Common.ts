//共通処理

/// <reference types="types-for-adobe/AfterEffects/22.0" />

import "../../node_modules/extendscript-es5-shim-ts";

export type TransformValue = {
    scaleValue: ThreeDPoint;
    anchorPointValue: ThreeDPoint;
    anchorPointValueWithScale: ThreeDPoint;
    positionValue: ThreeDPoint;
    rotationValue: number;
    opacityValue: number;
    rect: Rect;
    rectWithScale: Rect;
};

export type Kbar = {
    button: {
        argument: string;
        id: string; // A randomly generated string by KBar
        name: string; // The name the user set for the button
    };
    version: string; // KBar version like '3.0.0'
    JSON: string; // Lets you stringify/parse JSON strings
    aeq: any; // Lets you use aequery
};

export class Common {
    private static readonly EXPRESSION_DIR =
        "C:\\Users\\tera\\Documents\\Adobe\\TypeScript\\src\\MillorText\\expression";

    /**
     * コンポジションがアクティブかチェック
     * @returns
     */
    static isActiveComp() {
        let isActive = true;

        const acriveItem = app.project.activeItem;
        if (acriveItem == null || !(acriveItem instanceof CompItem)) {
            isActive = false;
            alert("Select Composition.");
        }

        return isActive;
    }

    /**
     * レイヤのトランスフォームを取得
     * @param i_layer
     * @returns
     */
    static getLayerTransform(i_layer: Layer) {
        const scale = i_layer.scale;
        const anchorPoint = i_layer.anchorPoint;
        const position = i_layer.position;
        const rotation = i_layer.rotation;
        const opacity = i_layer.opacity;

        return { scale, anchorPoint, position, rotation, opacity };
    }

    /**
     * レイヤのトランスフォームの値を取得
     * @param i_layer
     * @returns
     */
    static getLayerTransformValue(i_layer: Layer): TransformValue {
        const scaleValue = i_layer.scale.value;
        const anchorPointValue = i_layer.anchorPoint.value;
        const anchorPointValueWithScale: ThreeDPoint = [
            (anchorPointValue[0] * scaleValue[0]) / 100,
            (anchorPointValue[1] * scaleValue[1]) / 100,
            (anchorPointValue[2] * scaleValue[2]) / 100,
        ];
        const positionValue = i_layer.position.value;
        const rotationValue = i_layer.rotation.value;
        const opacityValue = i_layer.opacity.value;
        const rect = i_layer.sourceRectAtTime(i_layer.time, true);
        const rectWithScale: Rect = {
            top: (rect.top * scaleValue[0]) / 100,
            left: (rect.left * scaleValue[1]) / 100,
            width: (rect.width * scaleValue[0]) / 100,
            height: (rect.height * scaleValue[1]) / 100,
        };

        return {
            scaleValue,
            anchorPointValue,
            anchorPointValueWithScale,
            positionValue,
            rotationValue,
            opacityValue,
            rect,
            rectWithScale,
        };
    }

    /**
     * レイヤの親を設定
     * @param i_parentLayer
     * @param i_layers
     */
    static setParentLayer(
        i_parentLayer: Layer,
        i_layers: Layer[] | LayerCollection
    ) {
        if (i_layers instanceof LayerCollection) {
            for (let l = 1; l <= i_layers.length; l++) {
                const layer = i_layers[l];
                const wasLocked = layer.locked;
                layer.locked = false;
                if (layer != i_parentLayer && layer.parent == null) {
                    layer.parent = i_parentLayer;
                }
                layer.locked = wasLocked;
            }
        } else {
            i_layers.forEach((layer) => {
                const wasLocked = layer.locked;
                layer.locked = false;
                if (layer != i_parentLayer && layer.parent == null) {
                    layer.parent = i_parentLayer;
                }
                layer.locked = wasLocked;
            });
        }
    }

    /**
     * エクスプレッションを文字列として読み込む
     * @param i_expressionFileName
     * @returns
     */
    static loadExpression(i_expressionFileName: string) {
        let exText = "";
        const expressionFilePath =
            this.EXPRESSION_DIR + "\\" + i_expressionFileName;
        const fileObj = new File(expressionFilePath);
        if (fileObj.open("r")) {
            exText = fileObj.read();
        }

        return exText;
    }

    /**
     * 選択されているレイヤの中からコンポジションを抽出
     * 1つもコンポジションが選択されていない場合はアクティブコンポジションを返す
     * @param i_acriveComp
     * @returns
     */
    static extractComps(i_acriveComp: CompItem) {
        let comps: CompItem[] = [];

        const selectedLayers = i_acriveComp.selectedLayers;
        selectedLayers.forEach((selectedLayer) => {
            const item = selectedLayer.source;
            if (item instanceof CompItem) {
                comps.push(item);
            }
        });

        if (comps.length == 0) {
            comps.push(i_acriveComp);
        }

        return comps;
    }

    /**
     * 指定コンポジションが使用されているレイヤをすべて取得
     * @param i_comp
     * @returns
     */
    static extractCompLayers(i_comp: CompItem) {
        let compLayers: AVLayer[] = [];

        const usedComps = i_comp.usedIn;
        usedComps.forEach((usedComp) => {
            for (var l = 1; l <= usedComp.numLayers; l++) {
                var layer = usedComp.layer(l);
                const item = layer.source;
                if (item == i_comp) {
                    compLayers.push(layer as AVLayer);
                }
            }
        });

        return compLayers;
    }

    /**
     * アンカーポイントを中心に動かす
     * @param i_layer
     */
    static moveAP2Center(i_layer: AVLayer) {
        const trfVal = this.getLayerTransformValue(i_layer);

        const newAPX = trfVal.rect.width / 2;
        const newAPY = trfVal.rect.height / 2;
        const newAPZ = trfVal.anchorPointValue[2];
        const newPosX =
            trfVal.positionValue[0] -
            trfVal.anchorPointValueWithScale[0] +
            trfVal.rectWithScale.width / 2;
        const newPosY =
            trfVal.positionValue[1] -
            trfVal.anchorPointValueWithScale[1] +
            trfVal.rectWithScale.height / 2;
        const newPosZ = trfVal.positionValue[2];

        i_layer.anchorPoint.setValueAtTime(0, [newAPX, newAPY, newAPZ]);
        i_layer.position.setValueAtTime(0, [newPosX, newPosY, newPosZ]);
    }

    /**
     * グローバル座標のRectを取得
     * @param i_layer
     * @returns
     */
    static getGrobalCoordinateRect(i_layer: Layer): Rect {
        let rect: Rect;
        const trfVal = this.getLayerTransformValue(i_layer);

        //レイヤの中心が原点
        if (i_layer instanceof TextLayer || i_layer instanceof ShapeLayer) {
            const left =
                trfVal.positionValue[0] -
                trfVal.anchorPointValueWithScale[0] +
                trfVal.rectWithScale.left;
            const top =
                trfVal.positionValue[1] -
                trfVal.anchorPointValueWithScale[1] +
                trfVal.rectWithScale.top;
            const width = trfVal.rectWithScale.width;
            const height = trfVal.rectWithScale.height;
            rect = { left, top, width, height };
        }
        //レイヤの左上が原点
        else {
            const left =
                trfVal.positionValue[0] - trfVal.anchorPointValueWithScale[0];
            const top =
                trfVal.positionValue[1] - trfVal.anchorPointValueWithScale[1];
            const width = trfVal.rectWithScale.width;
            const height = trfVal.rectWithScale.height;
            rect = { left, top, width, height };
        }

        return rect;
    }
}
