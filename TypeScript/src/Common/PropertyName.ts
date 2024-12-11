export class PropertyName {
    static readonly AVLayer = {
        Transform: "ADBE Transform Group",
    } as const;

    static readonly ShapeLayer = {
        Contents: "Contents",
        Group: "ADBE Vector Group",
        MaterialOptions: "ADBE Vector Materials Group",
        Ellipse: "ADBE Vector Shape - Ellipse",
        EllipseSize: "ADBE Vector Ellipse Size",
        Rect: "ADBE Vector Shape - Rect",
        RectSize: "ADBE Vector Rect Size",
        Polystar: "ADBE Vector Shape - Star",
        PolystarType: "ADBE Vector Star Type",
        PolystarPoints: "ADBE Vector Star Points",
        PolystarOuterRadius: "ADBE Vector Star Outer Radius",
        PathGroup: "ADBE Vector Shape - Group",
        Path: "ADBE Vector Shape",
        Fill: "ADBE Vector Graphic - Fill",
        Stroke: "ADBE Vector Graphic - Stroke",
        StrokeWidth: "ADBE Vector Stroke Width",
    } as const;
}
