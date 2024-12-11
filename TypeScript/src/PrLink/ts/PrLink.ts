// Prとの連携時に実行

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";
import { DeComposeTextComp } from "./DeComposeTextComp";
import { ReplaceFile2MediaFolderFile } from "./ReplaceFile2MediaFolderFile";
import { TrimCompDuration } from "./TrimCompDuration";
import { SortLayer } from "./SortLayer";

class PrLink {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const deComposeTextComp = new DeComposeTextComp();
        const replaceFile2MediaFolderFile = new ReplaceFile2MediaFolderFile();
        const trimCompDuration = new TrimCompDuration();
        const sortLayer = new SortLayer();

        deComposeTextComp.main();
        replaceFile2MediaFolderFile.main();
        trimCompDuration.main();
        sortLayer.main();
    }
}

const prLink = new PrLink();
app.beginUndoGroup(prLink.scriptName);
prLink.main();
app.endUndoGroup();
