// コンポジションのデュレーションを中のレイヤのデュレーションにトリム
// ../CompDuration/TrimCompDuration と同じクラスだが、undoGroupを消すために出張

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

export class TrimCompDuration {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const comps = Common.extractComps(acriveComp);
        comps.forEach((comp) => {
            this.trimIncludedCompDuration(comp);
        });
    }

    /**
     * レイヤとして含まれるコンポジションまで再帰的に処理
     * @param i_comp
     */
    private trimIncludedCompDuration(i_comp: CompItem) {
        for (let l = 1; l <= i_comp.numLayers; l++) {
            const item = i_comp.layer(l).source;
            if (item instanceof CompItem) {
                this.trimAndMoveStartPoint(item);
            }
        }
        this.trimAndMoveStartPoint(i_comp);
    }

    /**
     * コンポジションのデュレーションをトリムしたのちスタートポイントを移動
     * @param i_comp
     * @returns
     */
    private trimAndMoveStartPoint(i_comp: CompItem) {
        const startPoint = this.trimCompDuration(i_comp);
        if (startPoint == 0) return;
        this.moveStartPoint(i_comp, startPoint);
    }

    /**
     * コンポジションの中のレイヤの始まりから終わりの長さになるようデュレーションをトリム
     * @param i_comp
     * @returns
     */
    private trimCompDuration(i_comp: CompItem) {
        if (i_comp.numLayers == 0) return 0;

        let minInPoint = Number.MAX_VALUE;
        let maxOutPoint = 0;

        //レイヤの最小インポイントと最大アウトポイントを探索
        for (let l = 1; l <= i_comp.numLayers; l++) {
            const layer = i_comp.layer(l);
            minInPoint = Math.min(minInPoint, layer.inPoint);
            maxOutPoint = Math.max(maxOutPoint, layer.outPoint);
        }

        //一番最初に始まるレイヤのインポイントが0になるように全レイヤを移動
        for (let l = 1; l <= i_comp.numLayers; l++) {
            const layer = i_comp.layer(l);
            layer.startTime -= minInPoint;
        }

        //デュレーションをトリム
        i_comp.duration = maxOutPoint - minInPoint;

        const compStartTime = minInPoint;

        return compStartTime;
    }

    /**
     * コンポジションのスタートポイントを移動
     * @param i_comp
     * @param i_compStartPoint
     */
    private moveStartPoint(i_comp: CompItem, i_compStartPoint: number) {
        const compLayers = Common.extractCompLayers(i_comp);
        compLayers.forEach((compLayer) => {
            compLayer.startTime = i_compStartPoint;
        });
    }
}
