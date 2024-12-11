// 動画レイヤーをインポイントが遅い順にソートし、テキストレイヤをその上に配置

/// <reference types="types-for-adobe/AfterEffects/22.0" />

type MovieLayerInfo = {
    layer: Layer;
    inPoint: number;
    outPoint: number;
};

export class SortLayer {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        const acriveComp = app.project.activeItem as CompItem;
        const layers = acriveComp.layers;
        const movieLayerInfo = this.sortMovieLayer(layers);
        this.sourtOtherLayer(layers, movieLayerInfo);
    }

    /**
     * 動画レイヤーをソート
     * @param i_layers
     * @returns
     */
    sortMovieLayer(i_layers: LayerCollection) {
        var movieLayerInfo: MovieLayerInfo[] = []; //配列内→{layer, inPoint, outPoint}

        for (let l = i_layers.length; l > 0; l--) {
            const layer = i_layers[l];
            const inPoint = layer.inPoint;
            const outPoint = layer.outPoint;

            layer.moveToEnd();
            movieLayerInfo.push({ layer, inPoint, outPoint });

            //インポイントが0のレイヤ＝動画の始まりのレイヤなので動画レイヤ探索を終了
            if (inPoint == 0) break;
        }

        return movieLayerInfo;
    }

    /**
     * 動画レイヤ以外のレイヤをソート
     * @param i_allLayers
     * @param i_movieLayerInfo
     */
    sourtOtherLayer(
        i_allLayers: LayerCollection,
        i_movieLayerInfo: MovieLayerInfo[]
    ) {
        const allLayerLength = i_allLayers.length;
        const movieLayerLength = i_movieLayerInfo.length;
        const firstMovieLayerIdx = allLayerLength - movieLayerLength + 1;

        //各動画レイヤの上にアウトポイントがかぶっているレイヤを移動
        i_movieLayerInfo.forEach((movieLayerInfo) => {
            const mLayer = movieLayerInfo.layer;
            const mInPoint = movieLayerInfo.inPoint;
            const mOutPoint = movieLayerInfo.outPoint;

            //動画レイヤにアウトポイントがかぶっているレイヤを抽出
            let childLayers: Layer[] = [];
            for (let l = 1; l < firstMovieLayerIdx; l++) {
                const layer = i_allLayers[l];
                const outPoint = layer.outPoint;

                //比較のため小数点を合わせる
                const mi = parseFloat(mInPoint.toFixed(2));
                const mo = parseFloat(mOutPoint.toFixed(2));
                const o = parseFloat(outPoint.toFixed(2));

                if (mi < o && o <= mo) {
                    childLayers.push(layer);
                }
            }

            //メインレイヤの上にレイヤを移動
            let pLayer = mLayer;
            childLayers.forEach((childLayer) => {
                childLayer.moveBefore(pLayer);
                pLayer = childLayer;
            });
        });
    }
}
