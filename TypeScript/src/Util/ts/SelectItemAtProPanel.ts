// 選択したレイヤのソースをプロジェクトパネル上で選択状態にする

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

class SelectItemAtProPanel {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        this.unSelectAllItem();
        const acriveComp = app.project.activeItem as CompItem;
        this.selectItem(acriveComp);
    }

    /**
     * 全アイテムの選択解除
     */
    private unSelectAllItem() {
        const allItems = app.project.items;

        for (let i = 1; i <= allItems.length; i++) {
            const item = allItems[i];
            if (item.selected == true) {
                item.selected = false;
            }
        }
    }

    /**
     * 選択状態にする
     * @param i_activeComp
     */
    private selectItem(i_activeComp: CompItem) {
        const selectedLayers = i_activeComp.selectedLayers;
        if (selectedLayers.length == 0) {
            i_activeComp.selected = true;
        } else {
            selectedLayers.forEach((layer) => (layer.source.selected = true));
        }
    }
}

// The main script.
const selectItemAtProPanel = new SelectItemAtProPanel();
app.beginUndoGroup(selectItemAtProPanel.scriptName);
selectItemAtProPanel.main();
app.endUndoGroup();
