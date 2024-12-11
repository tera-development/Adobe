// テキストレイヤのみのコンポジションをデコンポーズして削除する

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

export class DeComposeTextComp {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        const acriveComp = app.project.activeItem as CompItem;
        var textComps = this.extractTextComps(acriveComp);
        this.deCompose(textComps);
        this.deleteComps(textComps);
    }

    /**
     * テキストレイヤのみのコンポジションを抽出
     * @param i_comp
     * @returns
     */
    private extractTextComps(i_comp: CompItem) {
        let comps: CompItem[] = [];

        for (let l = 1; l <= i_comp.numLayers; l++) {
            const layer = i_comp.layer(l);
            const item = layer.source;
            if (item instanceof CompItem) {
                if (this.isOnlyTextLayers(item)) {
                    comps.push(item);
                }
            }

            //選択状態のレイヤ上に後でレイヤがコピーされてしまうため選択解除しておく
            layer.selected = false;
        }

        return comps;
    }

    /**
     * デコンポーズ
     * @param i_comps
     */
    private deCompose(i_comps: CompItem[]) {
        i_comps.forEach((comp) => {
            const usedComps = comp.usedIn;

            usedComps.forEach((usedComp) => {
                var usedCompLayers = this.getCompLayers(usedComp, comp);

                usedCompLayers.forEach((usedCompLayer) => {
                    usedCompLayer.selected = true;
                    var compLayerIdx = usedCompLayer.index;
                    var copiedLayers = this.copyAllLayer(
                        usedComp,
                        comp,
                        compLayerIdx
                    );
                    this.copyLayerTransform2CopiedLayers(
                        usedCompLayer,
                        copiedLayers
                    );
                    usedCompLayer.remove();
                });
            });
        });
    }

    /**
     * コンポジションを削除
     * @param i_comps
     */
    private deleteComps(i_comps: CompItem[]) {
        i_comps.forEach((comp) => {
            this.deleteItem(comp);
        });
    }

    /**
     * コンポジション内がテキストレイヤのみかチェック
     * @param i_comp
     * @returns
     */
    private isOnlyTextLayers(i_comp: CompItem) {
        let isOnlyTextLayers = true;

        for (let l = 1; l <= i_comp.numLayers; l++) {
            if (!(i_comp.layer(l) instanceof TextLayer)) {
                isOnlyTextLayers = false;
                break;
            }
        }

        return isOnlyTextLayers;
    }

    /**
     * 親コンポジションの全レイヤの中から、子コンポジションが使用されているレイヤを取得する
     * @param i_parentComp
     * @param i_childComp
     * @returns
     */
    private getCompLayers(i_parentComp: CompItem, i_childComp: CompItem) {
        let compLayers: Layer[] = [];

        for (let l = 1; l <= i_parentComp.numLayers; l++) {
            const layer = i_parentComp.layer(l);
            if (layer.source == i_childComp) {
                compLayers.push(layer);
            }
        }

        return compLayers;
    }

    /**
     * ソースコンポジション内の全レイヤをターゲットコンポジション内にコピー
     * @param i_targetComp
     * @param i_sourceComp
     * @param i_sourceCompLayerIdx
     * @returns
     */
    private copyAllLayer(
        i_targetComp: CompItem,
        i_sourceComp: CompItem,
        i_sourceCompLayerIdx: number
    ) {
        const sourceNumLayers = i_sourceComp.numLayers;
        for (let l = 1; l <= sourceNumLayers; l++) {
            const layer = i_sourceComp.layer(l);
            layer.copyToComp(i_targetComp); //選択状態のレイヤ上にコピーされる
        }

        //コピーされたレイヤのみ抽出
        let copiedLayers: Layer[] = [];
        const newLayerIdx = i_sourceCompLayerIdx + sourceNumLayers;
        for (let l = newLayerIdx - sourceNumLayers; l < newLayerIdx; l++) {
            copiedLayers.push(i_targetComp.layer(l));
        }

        return copiedLayers;
    }

    /**
     * レイヤーのトランスフォームをコピーされた全レイヤに反映
     * @param i_sourceLayer
     * @param i_copiedLayers
     */
    private copyLayerTransform2CopiedLayers(
        i_sourceLayer: Layer,
        i_copiedLayers: Layer[]
    ) {
        //レイヤを動かすための親レイヤを作成
        //コンポジションとアンカーポイントを合わせるために平面を使用
        const comp = i_sourceLayer.containingComp;
        const parent3DLayer = comp.layers.addSolid(
            [0, 0, 0],
            "tmp",
            1920,
            1080,
            1
        );
        parent3DLayer.threeDLayer = true;

        //親レイヤを親に設定
        Common.setParentLayer(parent3DLayer, i_copiedLayers);

        //親レイヤのトランスフォームをソースレイヤに合わせる
        const pTransform = Common.getLayerTransform(parent3DLayer);
        const sTransformValue = Common.getLayerTransformValue(i_sourceLayer);
        pTransform.scale.setValue(sTransformValue.scaleValue);
        pTransform.anchorPoint.setValue(sTransformValue.anchorPointValue);
        pTransform.position.setValue(sTransformValue.positionValue);
        pTransform.rotation.setValue(sTransformValue.rotationValue);
        pTransform.opacity.setValue(sTransformValue.opacityValue);

        //平面削除前に親を解除しないとトランスフォームが反映されない
        this.releaseParentLayer(parent3DLayer, i_copiedLayers);

        //平面削除
        this.deleteItem(parent3DLayer.source as FootageItem);
    }

    /**
     * レイヤーの親情報を解除
     * @param i_parentLayer
     * @param i_layers
     */
    private releaseParentLayer(i_parentLayer: Layer, i_layers: Layer[]) {
        i_layers.forEach((layer) => {
            const wasLocked = layer.locked;
            layer.locked = false;
            if (layer.parent == i_parentLayer) {
                layer.parent = null;
            }
            layer.locked = wasLocked;
        });
    }

    /**
     * アイテム削除
     * @param i_item
     */
    private deleteItem(i_item: _ItemClasses) {
        const allItems = app.project.items;
        for (let i = 1; i <= allItems.length; i++) {
            const item = allItems[i];

            if (item instanceof FootageItem || item instanceof CompItem) {
                if (item == i_item) {
                    item.remove();
                    break;
                }
            }
        }
    }
}
