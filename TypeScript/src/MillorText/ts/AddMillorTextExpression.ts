// ミラーテキストエクスプレッションを追加

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";
import { MillorText } from "./ExpressionFile";

class AddMillorTextExpression {
    readonly scriptName: string;
    private readonly TEXT = "ReferenceText\nReferenceText";
    private readonly PARENT_FOLDER = "03_Common";

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        this.addReferenceTextComp();

        const acriveComp = app.project.activeItem as CompItem;
        const selectedTextLayers = this.extractSelectedTextLayers(acriveComp);

        //テキストレイヤが選択されていない場合テキストレイヤを新規作成
        if (selectedTextLayers.length == 0) {
            const textLayer = acriveComp.layers.addText();
            this.addExp(textLayer);
        } else {
            selectedTextLayers.forEach((textLayer) => {
                this.addExp(textLayer);
            });
        }
    }

    /**
     * ReferenceTextCompを作成
     * @returns
     */
    private addReferenceTextComp() {
        if (this.existReferenceTextComp()) return;

        const referenceTextComp = app.project.items.addComp(
            MillorText.COMP_NAME,
            1920,
            1080,
            1,
            10,
            30
        );
        const parentFolder = this.getParentFolder();
        if (parentFolder != null) {
            referenceTextComp.parentFolder = parentFolder;
        }
        const textLayer = referenceTextComp.layers.addText();
        textLayer.name = MillorText.LAYER_NAME;
        const newText = new TextDocument(this.TEXT);
        textLayer.sourceText.setValue(newText);
    }

    /**
     * ReferenceTextCompがあるかチェック
     * @returns
     */
    private existReferenceTextComp() {
        let existReferenceTextComp = false;

        const allItems = app.project.items;
        for (let i = 1; i <= allItems.length; i++) {
            const item = allItems[i];
            if (item instanceof CompItem && item.name == MillorText.COMP_NAME) {
                existReferenceTextComp = true;
                break;
            }
        }

        return existReferenceTextComp;
    }

    /**
     * コンポジションを追加するフォルダを取得
     * @returns
     */
    private getParentFolder() {
        let parentFolder: FolderItem;
        const allItems = app.project.items;
        for (let i = 1; i <= allItems.length; i++) {
            const item = allItems[i];
            if (item instanceof FolderItem && item.name == this.PARENT_FOLDER) {
                parentFolder = item;
                break;
            }
        }

        return parentFolder;
    }

    /**
     * 選択されたテキストレイヤを抽出
     * @param i_comp
     * @returns
     */
    private extractSelectedTextLayers(i_comp: CompItem) {
        let textLayers: TextLayer[] = [];
        const selectedLayers = i_comp.selectedLayers;

        selectedLayers.forEach((selectedLayer) => {
            if (selectedLayer instanceof TextLayer) {
                textLayers.push(selectedLayer);
            }
        });

        return textLayers;
    }

    /**
     * テキストレイヤにエクスプレッションを適用
     * @param i_textLayer
     */
    private addExp(i_textLayer: TextLayer) {
        const expression = Common.loadExpression(MillorText.FILE_NAME);
        i_textLayer.sourceText.expression = expression;
    }
}

const addMillorTextExpression = new AddMillorTextExpression();
app.beginUndoGroup(addMillorTextExpression.scriptName);
addMillorTextExpression.main();
app.endUndoGroup();
