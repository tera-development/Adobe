// コンポジションサイズをデフォルトにする

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common, TransformValue } from "../../Common/Common";

type LayerInfo = {
    transformValue: TransformValue;
    rect: { top: number; left: number; width: number; height: number };
};

class ScaleComp2DefaultSize {
    readonly scriptName: string;
    private readonly defaultWidth = 1920;
    private readonly defaultHeight = 1080;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const comps = Common.extractComps(acriveComp);
        comps.forEach((comp) => {
            const compLayers = Common.extractCompLayers(comp);
            const layerInfos = this.moveLayersAP2Center(compLayers);
            this.scaleCompSize(comp);
            this.returnAP(compLayers, layerInfos);
        });
    }

    /**
     * レイヤのアンカーポイントを中心に動かす
     * @param i_layers
     * @returns
     */
    private moveLayersAP2Center(i_layers: AVLayer[]) {
        const layerInfos: LayerInfo[] = [];

        i_layers.forEach((layer) => {
            //アンカーポイントを元の位置に戻すため保存
            const transformValue = Common.getLayerTransformValue(layer);
            const rect = layer.sourceRectAtTime(0, false);
            layerInfos.push({ transformValue, rect });

            Common.moveAP2Center(layer);
        });

        return layerInfos;
    }

    /**
     * コンポジションサイズを変更する
     * @param i_comp
     */
    private scaleCompSize(i_comp: CompItem) {
        // Create a parent layer.
        var parent3DLayer = i_comp.layers.addShape();
        parent3DLayer.threeDLayer = true;

        // Set its position to center.
        var w = i_comp.width / 2;
        var h = i_comp.height / 2;
        parent3DLayer.position.setValue([w, h, 0]);

        // Set parent3DLayer as parent of all layers that don't have parents.
        Common.setParentLayer(parent3DLayer, i_comp.layers);

        // Set new comp width and height.
        var newWidth =
            i_comp.width < this.defaultWidth ? this.defaultWidth : i_comp.width;
        var newHeight =
            i_comp.height < this.defaultHeight
                ? this.defaultHeight
                : i_comp.height;
        i_comp.width = newWidth;
        i_comp.height = newHeight;

        // Set null 3D layer position to center.
        w = i_comp.width / 2;
        h = i_comp.height / 2;
        parent3DLayer.position.setValue([w, h, 0]);

        // Delete the super parent parent3DLayer with dejumping enabled.
        parent3DLayer.remove();
    }

    /**
     * アンカーポイントを元の位置に戻す
     * @param i_layers
     * @param i_layerInfos
     */
    private returnAP(i_layers: Layer[], i_layerInfos: LayerInfo[]) {
        i_layers.forEach((layer, i) => {
            const layerInfo = i_layerInfos[i];
            const trfValue = layerInfo.transformValue;
            const rect = layerInfo.rect;
            const currentTrfValue = Common.getLayerTransformValue(layer);

            const newApX =
                currentTrfValue.anchorPointValue[0] +
                trfValue.anchorPointValue[0] -
                rect.width / 2;
            const newApY =
                currentTrfValue.anchorPointValue[1] +
                trfValue.anchorPointValue[1] -
                rect.height / 2;
            const newApZ = trfValue.anchorPointValue[2];
            const newPosX = trfValue.positionValue[0];
            const newPosY = trfValue.positionValue[1];
            const newPosZ = trfValue.positionValue[2];

            layer.anchorPoint.setValueAtTime(0, [newApX, newApY, newApZ]);
            layer.position.setValueAtTime(0, [newPosX, newPosY, newPosZ]);
        });
    }
}

const scaleComp2DefaultSize = new ScaleComp2DefaultSize();
app.beginUndoGroup(scaleComp2DefaultSize.scriptName);
scaleComp2DefaultSize.main();
app.endUndoGroup();
