// レイヤのデュレーションを指定した値にトリム

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common } from "../../Common/Common";

class TrimCompDuration {
    readonly scriptName: string;
    private readonly IS_DEBUG = false;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const layers = acriveComp.selectedLayers;
        if (layers.length === 0) {
            alert("Select layer.");
            return;
        }

        const palette = this.showUI(layers, acriveComp.frameRate);
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
     * UI作成

     * @param i_layers 
     * @param i_frameRate 
     * @returns 
     */
    private showUI(i_layers: Layer[], i_frameRate: number) {
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
        text.text = "Layer duration.";

        //text入力欄
        const input = group.add("edittext");
        const currentDuration = timeToCurrentFormat(
            i_layers[0].outPoint - i_layers[0].inPoint,
            i_frameRate
        );
        input.text = currentDuration;
        input.alignment = ["fill", "top"];

        //チェックボックス
        const checkBox = group.add("checkbox");
        checkBox.alignment = ["fill", "top"];
        checkBox.text = "Extend";
        checkBox.value = false;

        //OKボタン
        const okBtn = group.add("button", undefined, "OK", { name: "ok" });
        okBtn.alignment = ["fill", "center"];
        okBtn.text = "OK";
        palette.defaultElement = okBtn; //Enterで適用される設定

        if (this.IS_DEBUG) {
            this.onOKClick(i_layers, i_frameRate, "00:01:00", true);
        } else {
            okBtn.onClick = () => {
                palette.close();
                this.onOKClick(
                    i_layers,
                    i_frameRate,
                    input.text,
                    checkBox.value
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
     * @param i_layers
     * @param i_frameRate
     * @param i_inputText
     * @param i_isExtend
     * @returns
     */
    private onOKClick(
        i_layers: Layer[],
        i_frameRate: number,
        i_inputText: string,
        i_isExtend: boolean
    ) {
        const duration = currentFormatToTime(i_inputText, i_frameRate);
        if (duration === 0) {
            alert("Invalid input duration.");
            return;
        }

        app.beginUndoGroup(trimCompDuration.scriptName);
        i_layers.forEach((layer) => {
            this.trimDuration(layer, duration, i_isExtend);
        });
        app.endUndoGroup();
    }

    /**
     * レイヤーのデュレーションをトリム
     * @param i_layer
     * @param i_duration
     * @param i_isExtend
     */
    private trimDuration(
        i_layer: Layer,
        i_duration: number,
        i_isExtend: boolean
    ) {
        const basePoint = i_isExtend ? i_layer.outPoint : i_layer.inPoint;
        const outPoint = basePoint + i_duration;
        i_layer.outPoint = outPoint;
    }
}

const trimCompDuration = new TrimCompDuration();
trimCompDuration.main();
