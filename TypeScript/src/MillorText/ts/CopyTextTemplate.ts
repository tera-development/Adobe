// テキストテンプレートをコピーする

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common, TransformValue } from "../../Common/Common";
import { PropertyName } from "../../Common/PropertyName";
import { CommandId } from "../../Common/CommandId";
import { CommonDef, MillorLayer } from "./ExpressionFile";

type TextTemplateComp = {
    [compName: string]: CompItem;
};

type TextLayerInfo = {
    text: string;
    containingComp: CompItem;
    containingFolder: FolderItem;
    transformValue: TransformValue;
    inPoint: number;
    duration: number;
};

class CopyTextTemplate {
    readonly scriptName: string;
    private readonly IS_DEBUG = false;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const textLayers = this.extractSelectedTextLayers(acriveComp);
        if (textLayers.length == 0) {
            alert("Select TextLayer.");
            return;
        }

        const templateComps = this.extractTextTemplateComps();
        if (Object.keys(templateComps).length === 0) {
            alert("Not exist template comp.");
            return;
        }

        const palette = this.showUI(textLayers, templateComps);
        if (palette == null) {
            alert("Could not open the user interface.");
            return;
        }

        if (!this.IS_DEBUG) {
            palette.center();
            palette.show();
        }
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
     * プロジェクトに追加済みのTextTemplateコンポジションのリスト取得
     * @returns
     */
    private extractTextTemplateComps() {
        let textTemplateComps: TextTemplateComp = {};
        const allItems = app.project.items;

        for (let i = 1; i <= allItems.length; i++) {
            const item = allItems[i];

            if (!(item instanceof CompItem)) continue;

            const compName = item.name;
            if (compName.match(CommonDef.SOURCE_COMP_PREFIX)) {
                textTemplateComps[compName] = item;
            }
        }

        return textTemplateComps;
    }

    /**
     * UI作成
     * @param i_selectedTextLayers
     * @param i_templateComps
     * @returns
     */
    private showUI(
        i_selectedTextLayers: TextLayer[],
        i_templateComps: TextTemplateComp
    ) {
        const palette = new Window("palette", this.scriptName, undefined, {
            resizeable: true,
        });
        if (palette == null) return null;

        //グループ
        const group = palette.add("group");
        group.orientation = "column";
        group.alignment = ["fill", "top"];
        group.alignChildren = ["left", "top"];
        group.spacing = 5;
        group.margins = 0;

        //UI説明用テキスト
        const text = group.add("statictext");
        text.alignment = ["left", "center"];
        text.text = "Select template composition.";

        //リスト
        const drpDwn = group.add("dropdownlist");
        drpDwn.alignment = ["fill", "top"];
        for (const key in i_templateComps) {
            drpDwn.add("item", key);
        }

        //チェックボックス
        const checkBox = group.add("checkbox");
        checkBox.alignment = ["fill", "top"];
        checkBox.text = "PropertyLink";
        checkBox.value = true;

        //OKボタン
        const okBtn = group.add("button");
        okBtn.alignment = ["fill", "center"];
        okBtn.text = "OK";

        if (this.IS_DEBUG) {
            this.forDebug(i_selectedTextLayers, i_templateComps);
        } else {
            okBtn.onClick = () => {
                palette.close();
                this.onOKClick(
                    i_selectedTextLayers,
                    i_templateComps,
                    drpDwn,
                    checkBox
                );
            };
        }

        palette.onResizing = palette.onResize = function () {
            this.layout.resize();
        };

        return palette;
    }

    /**
     * OKボタンクリック時の処理
     * @param i_selectedTextLayers
     * @param i_templateComps
     * @param i_dropDownList
     * @param i_checkBox
     * @returns
     */
    private onOKClick(
        i_selectedTextLayers: TextLayer[],
        i_templateComps: TextTemplateComp,
        i_dropDownList: DropDownList,
        i_checkBox: Checkbox
    ) {
        if (
            i_dropDownList.selection == null ||
            typeof i_dropDownList.selection == "number"
        ) {
            alert("Error to get selected item.");
            return;
        }
        const templateCompName = i_dropDownList.selection.text;
        const isCopyPropertyLink = i_checkBox.value;
        app.beginUndoGroup(this.scriptName);
        this.replaceTextLayer2TemplateComp(
            i_selectedTextLayers,
            i_templateComps,
            templateCompName,
            isCopyPropertyLink
        );
        app.endUndoGroup();
    }

    /**
     * Debug用
     * @param i_selectedTextLayers
     * @param i_templateComps
     */
    private forDebug(
        i_selectedTextLayers: TextLayer[],
        i_templateComps: TextTemplateComp
    ) {
        const templateCompName = "TXT_test";
        const isCopyPropertyLink = true;
        app.beginUndoGroup(this.scriptName);
        this.replaceTextLayer2TemplateComp(
            i_selectedTextLayers,
            i_templateComps,
            templateCompName,
            isCopyPropertyLink
        );
        app.endUndoGroup();
    }

    /**
     * 選択されたテキストレイヤをTextTemplateコンポジションに置き換え
     * @param i_selectedTextLayers
     * @param i_templateComps
     * @param i_templateCompName
     * @param i_isCopyPropertyLink
     */
    private replaceTextLayer2TemplateComp(
        i_selectedTextLayers: TextLayer[],
        i_templateComps: TextTemplateComp,
        i_templateCompName: string,
        i_isCopyPropertyLink: boolean
    ) {
        const templateComp = i_templateComps[i_templateCompName];

        i_selectedTextLayers.forEach((originalLayer) => {
            //選択されたテキストレイヤ(=originalLayer)の情報を取得
            const oriLayerInfo = this.getTextLayerInfo(originalLayer);

            let newComp: CompItem;
            //新しくコンポジションをコピー
            if (i_isCopyPropertyLink) {
                newComp = this.copyCompWithPropertyLinks(
                    templateComp,
                    oriLayerInfo.containingFolder,
                    oriLayerInfo.text
                );
                this.cancelPropertyLinks(templateComp, newComp);
                this.addMillorTextExpression(newComp, templateComp.name);
            } else {
                newComp = this.copyComp(
                    templateComp,
                    oriLayerInfo.containingFolder,
                    oriLayerInfo.text
                );
            }

            //新しくコピーしたテキストレイヤにオリジナルテキストレイヤの情報を反映
            const sourceTextLayer = this.extractSourceTextLayer(newComp.layers);
            const srcLayerInfo = this.getTextLayerInfo(sourceTextLayer);
            this.updateText(sourceTextLayer, oriLayerInfo.text);
            const fontSizeRatio = this.culcFontSizeRatio(
                sourceTextLayer,
                originalLayer
            );
            this.copyLayerTransform(
                newComp,
                srcLayerInfo.transformValue,
                oriLayerInfo.transformValue,
                fontSizeRatio
            );

            //新しくコピーしたコンポジションをレイヤに追加し、originalLayerを削除
            const newLayer = oriLayerInfo.containingComp.layers.add(newComp);
            newLayer.outPoint = oriLayerInfo.duration;
            newLayer.startTime = oriLayerInfo.inPoint;
            newLayer.moveBefore(originalLayer);
            newLayer.label = originalLayer.label; //ラベルの色をテキストレイヤと同じにする
            originalLayer.remove();
        });
    }

    /**
     * テキストレイヤの各情報を取得
     * @param i_textLayer
     * @returns
     */
    private getTextLayerInfo(i_textLayer: TextLayer) {
        const text = i_textLayer.sourceText.value.text;
        const containingComp = i_textLayer.containingComp;
        const containingFolder = containingComp.parentFolder;
        const transformValue = Common.getLayerTransformValue(i_textLayer);
        const inPoint = i_textLayer.inPoint;
        const duration = i_textLayer.outPoint - i_textLayer.inPoint;

        const textLayerInfo: TextLayerInfo = {
            text,
            containingComp,
            containingFolder,
            transformValue,
            inPoint,
            duration,
        };

        return textLayerInfo;
    }

    /**
     * コンポジションをコピー
     * @param i_sourceComp
     * @param i_targetFolder
     * @param i_newCompName
     * @returns
     */
    private copyComp(
        i_sourceComp: CompItem,
        i_targetFolder: FolderItem,
        i_newCompName: string
    ) {
        const newComp = this.duplicateComp(
            i_sourceComp,
            i_targetFolder,
            i_newCompName
        );
        //AEJuiceが勝手につけたマーカーを削除
        this.deleteMarker(newComp);

        return newComp;
    }

    /**
     * コンポジションをプロパティリンクと一緒にコピー
     * @param i_sourceComp
     * @param i_targetFolder
     * @param i_newCompName
     * @returns
     */
    private copyCompWithPropertyLinks(
        i_sourceComp: CompItem,
        i_targetFolder: FolderItem,
        i_newCompName: string
    ) {
        const newComp = this.duplicateComp(
            i_sourceComp,
            i_targetFolder,
            i_newCompName
        );
        this.deleteAllLayer(newComp);
        this.copyAllLayerWithPropertyLinks(i_sourceComp, newComp);
        //コピー時にレイヤの後ろの数字がインクリメントされてしまうので元の名前に戻す
        this.copyLayerName(i_sourceComp, newComp);
        //AEJuiceが勝手につけたマーカーを削除
        this.deleteMarker(newComp);

        return newComp;
    }

    /**
     * 指定フォルダにコンポジションを複製
     * @param i_sourceComp
     * @param i_targetFolder
     * @param i_newCompName
     * @returns
     */
    private duplicateComp(
        i_sourceComp: CompItem,
        i_targetFolder: FolderItem,
        i_newCompName: string
    ) {
        const newComp = i_sourceComp.duplicate();
        newComp.parentFolder = i_targetFolder;
        if (i_newCompName != "") {
            newComp.name = i_newCompName;
        }

        return newComp;
    }

    /**
     * コンポジション内のレイヤを削除
     * @param i_comp
     */
    private deleteAllLayer(i_comp: CompItem) {
        for (let l = i_comp.numLayers; l > 0; l--) {
            i_comp.layer(l).remove();
        }
    }

    /**
     * 全レイヤをプロパティリンクと一緒にコピー
     * @param i_sourceComp
     * @param i_targetComp
     */
    private copyAllLayerWithPropertyLinks(
        i_sourceComp: CompItem,
        i_targetComp: CompItem
    ) {
        this.openInViewer(i_sourceComp);
        app.executeCommand(CommandId.SelectAll); //すべてを選択
        app.endUndoGroup(); //Undoグループを閉じないとプロパティリンクコピーができない
        app.executeCommand(CommandId.CopywithPropertyLinks); //プロパティリンクと一緒にコピー
        app.beginUndoGroup(this.scriptName); //Undoグループ再開
        app.executeCommand(CommandId.Close); //閉じる
        this.openInViewer(i_targetComp);
        app.executeCommand(CommandId.Paste); //ペースト
        app.executeCommand(CommandId.Close); //閉じる
    }

    /**
     * コンポジションをビューワーで表示
     * @param i_comp
     */
    private openInViewer(i_comp: CompItem) {
        //1回じゃ開かない時があるので複数回実行
        i_comp.openInViewer();
        i_comp.openInViewer();
        i_comp.openInViewer();
        i_comp.openInViewer();
        i_comp.openInViewer();
    }

    /**
     * レイヤー名をコピーする
     * @param i_sourceComp
     * @param i_targetComp
     */
    private copyLayerName(i_sourceComp: CompItem, i_targetComp: CompItem) {
        for (let l = 1; l <= i_sourceComp.numLayers; l++) {
            i_targetComp.layer(l).name = i_sourceComp.layer(l).name;
        }
    }

    /**
     * マーカーを削除する
     * AEJuiceが勝手にマーカーをつけるため必要
     * @param i_comp
     */
    private deleteMarker(i_comp: CompItem) {
        for (let l = i_comp.numLayers; l > 0; l--) {
            const layer = i_comp.layer(l);
            const markerKey = layer.marker.numKeys;
            for (let m = 1; m <= markerKey; m++) {
                layer.marker.removeKey(m);
            }
        }
    }

    /**
     * もともとエクスプレッションがある場合や、ミラーしたくないプロパティのPropertyLinkを解除する
     * @param i_sourceComp
     * @param i_targetComp
     */
    private cancelPropertyLinks(
        i_sourceComp: CompItem,
        i_targetComp: CompItem
    ) {
        for (let l = 1; l <= i_sourceComp.numLayers; l++) {
            const souceLayer = i_sourceComp.layer(l);
            const targetLayer = i_targetComp.layer(l);
            for (let p = 1; p <= souceLayer.numProperties; p++) {
                this.adjustmentPropertyExpression(
                    souceLayer.property(p),
                    targetLayer.property(p)
                );
            }
        }
    }

    /**
     * プロパティを全探索して該当プロパティのエクスプレッションを調整
     * @param i_sourceProps
     * @param i_targetProps
     * @returns
     */
    private adjustmentPropertyExpression(
        i_sourceProps: _PropertyClasses,
        i_targetProps: _PropertyClasses
    ) {
        this.enableExpression(i_targetProps);
        this.copyExpression(i_sourceProps, i_targetProps);

        if (i_sourceProps instanceof Property) return;

        //子プロパティも再帰的に処理
        for (let p = 1; p <= i_sourceProps.numProperties; p++) {
            this.adjustmentPropertyExpression(
                i_sourceProps.property(p),
                i_targetProps.property(p)
            );
        }
    }

    /**
     * PropertyLinkしたくないプロパティのエクスプレッションを無効にする
     * @param i_prop
     */
    private enableExpression(i_prop: _PropertyClasses) {
        if (i_prop.matchName == PropertyName.AVLayer.Transform) {
            for (let i = 1; i <= (i_prop as PropertyGroup).numProperties; i++) {
                const childProp = i_prop.property(i);
                if (
                    childProp instanceof Property &&
                    childProp.canSetExpression
                ) {
                    childProp.expressionEnabled = false;
                }
            }
        }
    }

    /**
     * もともとエクスプレッションが設定されている場合はコピーする
     * @param i_sourceProp
     * @param i_targetProp
     */
    private copyExpression(
        i_sourceProp: _PropertyClasses,
        i_targetProp: _PropertyClasses
    ) {
        if (
            i_sourceProp instanceof Property &&
            i_targetProp instanceof Property
        ) {
            if (i_sourceProp.expressionEnabled) {
                i_targetProp.expression = i_sourceProp.expression;
            }
        }
    }

    /**
     * ミラーテキストエクスプレッション追加
     * @param i_targetComp
     * @param i_sourceCompName
     */
    private addMillorTextExpression(
        i_targetComp: CompItem,
        i_sourceCompName: string
    ) {
        for (let l = 1; l <= i_targetComp.numLayers; l++) {
            const layer = i_targetComp.layer(l);

            if (!(layer instanceof TextLayer)) continue;

            //ソーステキストレイヤかそれ以外かでエクスプレッションを切り替える
            const isSourceText = layer.name == CommonDef.SOURCE_TEXT_LAYER_NAME;
            const expressionFile = isSourceText
                ? MillorLayer.MILLOR_TEMPLATE_FILE_PATH
                : MillorLayer.MILLOR_SOURCE_FILE_PATH;
            let expression = Common.loadExpression(expressionFile);
            expression = expression.replace(
                MillorLayer.COMP_NAME,
                i_sourceCompName
            );
            if (!isSourceText)
                expression = expression.replace(
                    MillorLayer.LAYER_ID,
                    l.toString()
                );
            layer.sourceText.expression = expression;
        }
    }

    /**
     * ソーステキストレイヤを抽出
     * @param i_layers
     * @returns
     */
    private extractSourceTextLayer(i_layers: LayerCollection) {
        for (let l = 1; l <= i_layers.length; l++) {
            const layer = i_layers[l];
            if (layer.name == CommonDef.SOURCE_TEXT_LAYER_NAME) {
                return layer as TextLayer;
            }
        }
    }

    /**
     * テキストレイヤーのテキストを変更する
     * @param i_textLayer
     * @param i_text
     */
    private updateText(i_textLayer: TextLayer, i_text: string) {
        const newText = new TextDocument(i_text);
        i_textLayer.sourceText.setValue(newText);
    }

    /**
     * コピー後の文字サイズを合わせるために、フォントサイズの比を計算
     * @param i_sourceTextLayer
     * @param i_originalTextLayer
     * @returns
     */
    private culcFontSizeRatio(
        i_sourceTextLayer: TextLayer,
        i_originalTextLayer: TextLayer
    ) {
        const sourceFontSize = i_sourceTextLayer.sourceText.value.fontSize;
        const originalFontSize = i_originalTextLayer.sourceText.value.fontSize;
        return originalFontSize / sourceFontSize;
    }

    /**
     * オリジナルレイヤのトランスフォームをソースレイヤにコピー
     * @param i_sourceLayerContainingComp
     * @param i_sourceLayerTransform
     * @param i_originalLayerTransform
     * @param i_fontSizeRatio
     */
    private copyLayerTransform(
        i_sourceLayerContainingComp: CompItem,
        i_sourceLayerTransform: TransformValue,
        i_originalLayerTransform: TransformValue,
        i_fontSizeRatio: number
    ) {
        //全レイヤを動かすための親レイヤを作成
        const parent3DLayer = i_sourceLayerContainingComp.layers.addText();
        parent3DLayer.threeDLayer = true;

        //親レイヤをソースレイヤに合わせる
        parent3DLayer.scale.setValue(i_sourceLayerTransform.scaleValue);
        parent3DLayer.anchorPoint.setValue(
            i_sourceLayerTransform.anchorPointValue
        );
        parent3DLayer.position.setValue(i_sourceLayerTransform.positionValue);
        parent3DLayer.rotation.setValue(i_sourceLayerTransform.rotationValue);
        parent3DLayer.opacity.setValue(i_sourceLayerTransform.opacityValue);

        //親レイヤを親に設定
        Common.setParentLayer(
            parent3DLayer,
            i_sourceLayerContainingComp.layers
        );

        //親レイヤをオリジナルレイヤに合わせる
        parent3DLayer.scale.setValue([
            i_originalLayerTransform.scaleValue[0] * i_fontSizeRatio,
            i_originalLayerTransform.scaleValue[1] * i_fontSizeRatio,
            i_originalLayerTransform.scaleValue[2] * i_fontSizeRatio,
        ]);
        parent3DLayer.anchorPoint.setValue(
            i_originalLayerTransform.anchorPointValue
        );
        parent3DLayer.position.setValue(i_originalLayerTransform.positionValue);
        parent3DLayer.rotation.setValue(i_originalLayerTransform.rotationValue);
        parent3DLayer.opacity.setValue(i_originalLayerTransform.opacityValue);

        parent3DLayer.remove();
    }
}

const copyTextTemplate = new CopyTextTemplate();
app.beginUndoGroup(copyTextTemplate.scriptName);
copyTextTemplate.main();
app.endUndoGroup();
