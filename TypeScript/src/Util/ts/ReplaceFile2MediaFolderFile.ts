// ファイルをMediaフォルダ内のファイルに入れ替える

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

export class ReplaceFile2MediaFolderFile {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const fileLayers = this.extractFileLayers(acriveComp);
        const sourceFileId = this.replaceFileItem(fileLayers);
        this.deleteFileItem(sourceFileId);
    }

    /**
     * ファイルレイヤーを抽出
     * @param i_comp
     * @returns
     */
    private extractFileLayers(i_comp: CompItem) {
        let fileLayers: AVLayer[] = [];

        for (let l = 1; l <= i_comp.numLayers; l++) {
            const layer = i_comp.layer(l);
            const item = layer.source;

            if (item instanceof CompItem) {
                const nestFileLayers = this.extractFileLayers(item);
                fileLayers = fileLayers.concat(nestFileLayers);
            } else if (item instanceof FootageItem) {
                fileLayers.push(layer as AVLayer);
            }
        }

        return fileLayers;
    }

    /**
     * ファイルアイテム入れ替え
     * @param i_fileLayers
     * @returns
     */
    private replaceFileItem(i_fileLayers: AVLayer[]) {
        const sourceFileIds: number[] = [];
        const allItems = app.project.items;

        i_fileLayers.forEach((fileLayer) => {
            const fileItem = fileLayer.source;
            for (let i = 1; i <= allItems.length; i++) {
                const item = allItems[i];

                if (!(item instanceof FootageItem)) continue;

                if (item.id != fileItem.id && item.name == fileItem.name) {
                    fileLayer.replaceSource(item, false);
                    sourceFileIds.push(fileItem.id);
                    break;
                }
            }
        });

        return sourceFileIds;
    }

    /**
     * ファイルアイテム削除
     * @param i_fileIds
     */
    private deleteFileItem(i_fileIds: number[]) {
        const allItems = app.project.items;

        i_fileIds.forEach((fileId) => {
            for (let i = 1; i <= allItems.length; i++) {
                const item = allItems[i];

                if (!(item instanceof FootageItem)) continue;

                if (item.id == fileId) {
                    item.remove();
                    break;
                }
            }
        });
    }
}

const replaceFile2MediaFolderFile = new ReplaceFile2MediaFolderFile();
app.beginUndoGroup(replaceFile2MediaFolderFile.scriptName);
replaceFile2MediaFolderFile.main();
app.endUndoGroup();
