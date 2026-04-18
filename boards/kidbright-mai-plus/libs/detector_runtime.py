"""Object detector runtime for MaixCAM (CV181x) using `nn.YOLO11`.

Wraps the native detector into a uniform `Detector.detect(img, conf, iou)
-> list[Detection]` that's attribute-compatible with the V831 runtime
— blocks reading `.x`, `.y`, `.w`, `.h`, `.class_id`, `.score`, `.label`
work unchanged across boards.
"""
from maix import nn


class Detection:
    __slots__ = ("x", "y", "w", "h", "class_id", "score", "label")
    def __init__(self, x, y, w, h, class_id, score, label):
        self.x = x; self.y = y; self.w = w; self.h = h
        self.class_id = class_id
        self.score = score
        self.label = label


class Detector:
    def __init__(self, hash, labels, **_unused):
        self.labels = list(labels)
        self._model = nn.YOLO11(
            model=f"/root/model/{hash}.mud",
            dual_buff=True,
        )

    def detect(self, img, conf=0.5, iou=0.45):
        objects = self._model.detect(img, conf_th=conf, iou_th=iou)
        detections = []
        for obj in objects:
            cid = int(obj.class_id)
            detections.append(Detection(
                x=float(obj.x), y=float(obj.y),
                w=float(obj.w), h=float(obj.h),
                class_id=cid,
                score=float(obj.score),
                label=self.labels[cid] if cid < len(self.labels) else str(cid),
            ))
        return detections

    def __del__(self):
        try:
            del self._model
        except Exception:
            pass
