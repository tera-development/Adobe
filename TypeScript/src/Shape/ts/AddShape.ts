// shapeを追加する

/// <reference types="types-for-adobe/AfterEffects/22.0" />
import { Common, Kbar } from "../../Common/Common";
import { PropertyName } from "../../Common/PropertyName";

//#region debug
// const kbar: Kbar = {
//     button: {
//         argument: "VerticalLine",
//         id: "",
//         name: ""
//     },
//     version: "",
//     JSON: "",
//     aeq: ""
// }
//#endregion

class Circle {
    static readonly CONTENTS_NAME = "Circle";
    static readonly KBAR_ARG = {
        normal: "Circle",
        onlyFill: "CircleFill",
        onlyLine: "CircleLine",
    } as const;
    static readonly SIZE = {
        x: 500,
        y: 500,
    } as const;
    static readonly STROKE_WIDTH = 10;
}

class Rect {
    static readonly CONTENTS_NAME = "Rect";
    static readonly KBAR_ARG = {
        normal: "Rect",
        onlyFill: "RectFill",
        onlyLine: "RectLine",
    } as const;
    static readonly SIZE = {
        x: 500,
        y: 500,
    } as const;
    static readonly STROKE_WIDTH = 10;
}

class Polystar {
    static readonly CONTENTS_NAME = "Polystar";
    static readonly KBAR_ARG = {
        normal: "Polystar",
        onlyFill: "PolystarFill",
        onlyLine: "PolystarLine",
    } as const;
    static readonly TYPE = 2; //1:スター 2:多角形
    static readonly POINTS_SIZE = 6; //頂点の数
    static readonly RADIUS = 250;
    static readonly STROKE_WIDTH = 10;
}

class Line {
    static readonly CONTENTS_NAME = "Line";
    static readonly KBAR_ARG = {
        vertical: "VerticalLine",
        horizontal: "HorizontalLine",
    } as const;
    static readonly LENGTH = 500;
    static readonly STROKE_WIDTH = 10;
}

class AddShape {
    readonly scriptName: string;

    constructor() {
        this.scriptName = this.constructor.name;
    }

    main() {
        if (!Common.isActiveComp()) return;

        const acriveComp = app.project.activeItem as CompItem;
        const shapeLayer = acriveComp.layers.addShape();
        const shapeGroupProp = this.addShapeGroup(shapeLayer);

        //@ts-ignore
        const arg = kbar.button.argument as string;
        switch (arg) {
            //#region 円
            case Circle.KBAR_ARG.normal:
                this.addCircle(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Circle.KBAR_ARG.onlyFill:
                this.addCircle(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Circle.KBAR_ARG.onlyLine:
                this.addCircle(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                break;
            //#endregion 円

            //#region 四角
            case Rect.KBAR_ARG.normal:
                this.addRect(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Rect.KBAR_ARG.onlyFill:
                this.addRect(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Rect.KBAR_ARG.onlyLine:
                this.addRect(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                break;
            //#endregion 四角

            //#region 多角形
            case Polystar.KBAR_ARG.normal:
                this.addPolystar(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Polystar.KBAR_ARG.onlyFill:
                this.addPolystar(shapeGroupProp);
                this.addFill(shapeGroupProp);
                break;

            case Polystar.KBAR_ARG.onlyLine:
                this.addPolystar(shapeGroupProp);
                this.addStroke(shapeGroupProp);
                break;
            //#endregion 多角形

            //#region 直線
            case Line.KBAR_ARG.vertical:
                let isVertical = true;
                this.addLine(shapeGroupProp, isVertical);
                this.addStroke(shapeGroupProp);
                this.fixScale(shapeLayer, isVertical);
                break;

            case Line.KBAR_ARG.horizontal:
                isVertical = false;
                this.addLine(shapeGroupProp, isVertical);
                this.addStroke(shapeGroupProp);
                this.fixScale(shapeLayer, isVertical);
                break;
            //#endregion 直線

            default:
                alert(arg + " is not supported.");
                shapeLayer.remove();
                break;
        }
    }

    /**
     * シェイプグループを作成
     * ここにシェイプ情報を追加していく
     * @param i_shapeLayer
     * @returns
     */
    private addShapeGroup(i_shapeLayer: ShapeLayer) {
        const shapeGroupProp = this.addContents(
            i_shapeLayer,
            PropertyName.ShapeLayer.Group
        ) as PropertyGroup;
        shapeGroupProp
            .property(PropertyName.ShapeLayer.MaterialOptions)
            .remove(); //マテリアルオプションは使用しないので削除

        return shapeGroupProp;
    }

    /**
     * レイヤーまたはプロパティグループにコンテンツを追加
     * @param i_parentProp
     * @param i_contentsName
     * @returns
     */
    private addContents(
        i_parentProp: ShapeLayer | PropertyGroup,
        i_contentsName: string
    ) {
        const contentsProp = i_parentProp.property(
            PropertyName.ShapeLayer.Contents
        ) as PropertyGroup;
        const newContentsProp = contentsProp.addProperty(i_contentsName);

        return newContentsProp;
    }

    /**
     * 円を追加
     * @param i_shapeGroupProp
     */
    private addCircle(i_shapeGroupProp: PropertyGroup) {
        i_shapeGroupProp.name = Circle.CONTENTS_NAME;
        const circleProp = this.addContents(
            i_shapeGroupProp,
            PropertyName.ShapeLayer.Ellipse
        );
        const sizeProp = circleProp.property(
            PropertyName.ShapeLayer.EllipseSize
        ) as Property;
        sizeProp.setValue([Circle.SIZE.x, Circle.SIZE.y]);
    }

    /**
     * 四角を追加
     * @param i_shapeGroupProp
     */
    private addRect(i_shapeGroupProp: PropertyGroup) {
        i_shapeGroupProp.name = Rect.CONTENTS_NAME;
        const rectProp = this.addContents(
            i_shapeGroupProp,
            PropertyName.ShapeLayer.Rect
        );
        const sizeProp = rectProp.property(
            PropertyName.ShapeLayer.RectSize
        ) as Property;
        sizeProp.setValue([Circle.SIZE.x, Circle.SIZE.y]);
    }

    /**
     * 多角形を追加
     * @param i_shapeGroupProp
     */
    private addPolystar(i_shapeGroupProp: PropertyGroup) {
        i_shapeGroupProp.name = Polystar.CONTENTS_NAME;
        const polystarProp = this.addContents(
            i_shapeGroupProp,
            PropertyName.ShapeLayer.Polystar
        );
        const typeProp = polystarProp.property(
            PropertyName.ShapeLayer.PolystarType
        ) as Property;
        const pointsProp = polystarProp.property(
            PropertyName.ShapeLayer.PolystarPoints
        ) as Property;
        const radiusProp = polystarProp.property(
            PropertyName.ShapeLayer.PolystarOuterRadius
        ) as Property;
        typeProp.setValue(Polystar.TYPE);
        pointsProp.setValue(Polystar.POINTS_SIZE);
        radiusProp.setValue(Polystar.RADIUS);
    }

    /**
     * 直線を追加
     * @param i_shapeGroupProp
     * @param i_isVertical
     */
    private addLine(i_shapeGroupProp: PropertyGroup, i_isVertical: boolean) {
        const line = new Shape();
        const coordinate = Line.LENGTH / 2;
        line.vertices = i_isVertical
            ? [
                  [0, coordinate],
                  [0, -coordinate],
              ]
            : [
                  [coordinate, 0],
                  [-coordinate, 0],
              ];

        i_shapeGroupProp.name = Line.CONTENTS_NAME;
        const pathGroupProp = this.addContents(
            i_shapeGroupProp,
            PropertyName.ShapeLayer.PathGroup
        );
        const pathProp = pathGroupProp.property(
            PropertyName.ShapeLayer.Path
        ) as Property;
        pathProp.setValue(line);
    }

    /**
     * 塗りを追加
     * @param i_shapeGroupProp
     */
    private addFill(i_shapeGroupProp: PropertyGroup) {
        this.addContents(i_shapeGroupProp, PropertyName.ShapeLayer.Fill);
    }

    /**
     * 境界線を追加
     * @param i_shapeGroupProp
     */
    private addStroke(i_shapeGroupProp: PropertyGroup) {
        const strokeProp = this.addContents(
            i_shapeGroupProp,
            PropertyName.ShapeLayer.Stroke
        );
        const widthProp = strokeProp.property(
            PropertyName.ShapeLayer.StrokeWidth
        ) as Property;
        widthProp.setValue(Circle.STROKE_WIDTH);
    }

    /**
     * 直線の幅を変えずに長さを変更できるようスケールを固定
     * @param i_layer
     * @param i_isVertical
     */
    private fixScale(i_layer: ShapeLayer, i_isVertical: boolean) {
        const expression = i_isVertical ? "[100, value[1]]" : "[value[0], 100]";
        const scaleProp = i_layer.transform.scale;
        scaleProp.expression = expression;
    }
}

const addShape = new AddShape();
app.beginUndoGroup(addShape.scriptName);
addShape.main();
app.endUndoGroup();
