// レイヤーの中心座標をそろえる

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common, Kbar } from "../../Common/Common";

//#region debug
// const kbar: Kbar = {
//     button: {
//         argument: "X",
//         id: "",
//         name: ""
//     },
//     version: "",
//     JSON: "",
//     aeq: ""
// }
//#endregion

class KbarArg {
    static readonly x = "X";
    static readonly y = "Y";
}

class AlignCenterPos {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const selectedLayers = acriveComp.selectedLayers;

        //@ts-ignore
        const arg = kbar.button.argument as string;
        const isX = arg === KbarArg.x;
        let targetPos = 0;
        selectedLayers.forEach((layer, i) => {
            if (i == 0) {
                targetPos = this.culcCenterPos(layer, isX);
            } else {
                this.moveCenterPos(layer, targetPos, isX);
            }
        });
    }

    /**
     * レイヤの中心座標を計算
     * 左上原点にそろえる
     * @param i_layer
     * @param i_isX
     * @returns
     */
    private culcCenterPos(i_layer: Layer, i_isX: boolean) {
        let centerPos = 0;
        const transform = Common.getLayerTransformValue(i_layer);

        //アンカーポイントが真ん中原点かつ位置が左上原点
        if (i_layer instanceof ShapeLayer || i_layer instanceof TextLayer) {
            if (i_isX) {
                centerPos =
                    transform.rectWithScale.left +
                    transform.rectWithScale.width / 2 +
                    transform.positionValue[0] -
                    transform.anchorPointValueWithScale[0];
            } else {
                centerPos =
                    transform.rectWithScale.top +
                    transform.rectWithScale.height / 2 +
                    transform.positionValue[1] -
                    transform.anchorPointValueWithScale[1];
            }
        }
        //すべて左上原点
        else {
            if (i_isX) {
                centerPos =
                    transform.positionValue[0] -
                    transform.anchorPointValueWithScale[0] +
                    transform.rectWithScale.width / 2;
            } else {
                centerPos =
                    transform.positionValue[1] -
                    transform.anchorPointValueWithScale[1] +
                    transform.rectWithScale.height / 2;
            }
        }

        return centerPos;
    }

    /**
     * ボックスの中心を移動
     * @param i_layer
     * @param i_tergetPos
     * @param i_isX
     */
    private moveCenterPos(i_layer: Layer, i_tergetPos: number, i_isX: boolean) {
        const currentCenterPos = this.culcCenterPos(i_layer, i_isX);
        const posDiff = i_tergetPos - currentCenterPos;
        const transform = Common.getLayerTransformValue(i_layer);
        if (i_isX) {
            const newPosX = transform.positionValue[0] + posDiff;
            i_layer.position.setValue([
                newPosX,
                transform.positionValue[1],
                transform.positionValue[2],
            ]);
        } else {
            const newPosY = transform.positionValue[1] + posDiff;
            i_layer.position.setValue([
                transform.positionValue[0],
                newPosY,
                transform.positionValue[2],
            ]);
        }
    }
}

const alignCenterPos = new AlignCenterPos();
app.beginUndoGroup(alignCenterPos.scriptName);
alignCenterPos.main();
app.endUndoGroup();
