// コンポジションをテキストレイヤのテキストにリネーム

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";
import { CommonDef } from "./ExpressionFile";

class RenameCompToText {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const comps = Common.extractComps(acriveComp);
        comps.forEach((comp) => {
            this.renameComp(comp);
        });
    }

    /**
     * コンポジション名変更
     * @param i_comp
     */
    renameComp(i_comp: CompItem) {
        for (let l = 1; l <= i_comp.numLayers; l++) {
            const layer = i_comp.layer(l);

            if (!(layer instanceof TextLayer)) continue;

            if (layer.name == CommonDef.SOURCE_TEXT_LAYER_NAME) {
                i_comp.name = layer.sourceText.value.text;
                break;
            }
        }
    }
}

const renameCompToText = new RenameCompToText();
app.beginUndoGroup(renameCompToText.scriptName);
renameCompToText.main();
app.endUndoGroup();
