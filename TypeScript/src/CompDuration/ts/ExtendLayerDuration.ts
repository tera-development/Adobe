// レイヤーのデュレーションをコンポジションの最後まで伸ばす

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

class ExtendLayerDuration {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const layers = acriveComp.selectedLayers;
        layers.forEach((layer) => {
            this.extendLayerDuration(layer, acriveComp.duration);
        });
    }

    /**
     * レイヤーのデュレーションを伸ばす
     * @param i_layer
     * @param i_compDuration
     */
    private extendLayerDuration(i_layer: Layer, i_compDuration: number) {
        const diff = i_compDuration - i_layer.outPoint;
        i_layer.outPoint += diff;
    }
}

const extendLayerDuration = new ExtendLayerDuration();
app.beginUndoGroup(extendLayerDuration.scriptName);
extendLayerDuration.main();
app.endUndoGroup();
