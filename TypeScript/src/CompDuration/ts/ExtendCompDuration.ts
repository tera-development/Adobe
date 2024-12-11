// コンポジションのデュレーションを伸ばす

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

class ExtendCompDuration {
    readonly scriptName: string;
    private readonly DURATION_DIFF = 60; //秒

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        this.extendCompDuration(acriveComp);
    }

    /**
     * コンポジションのデュレーションを伸ばす
     * @param i_comp
     */
    private extendCompDuration(i_comp: CompItem) {
        i_comp.duration += this.DURATION_DIFF;
    }
}

const extendCompDuration = new ExtendCompDuration();
app.beginUndoGroup(extendCompDuration.scriptName);
extendCompDuration.main();
app.endUndoGroup();
