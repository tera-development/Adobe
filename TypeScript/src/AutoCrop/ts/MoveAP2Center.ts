// アンカーポイントを中心に移動

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

class MoveAP2Center {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const comps = Common.extractComps(acriveComp);
        comps.forEach((comp) => {
            const compLayers = Common.extractCompLayers(comp);
            compLayers.forEach((compLayer) => {
                Common.moveAP2Center(compLayer);
            });
        });
    }
}

const moveAP2Center = new MoveAP2Center();
app.beginUndoGroup(moveAP2Center.scriptName);
moveAP2Center.main();
app.endUndoGroup();
