"""Object detector runtime for V831 (YOLO slim).

Wraps AWNN `nn.load` + `decoder.Yolo2` behind a uniform
`Detector.detect(img, conf, iou) -> list[Detection]` API so blocks on both
boards use the same attributes (x, y, w, h, class_id, score, label).
"""
from maix import nn
from maix.nn import decoder


DEFAULT_ANCHORS = [1.19, 1.98, 2.79, 4.59, 4.53, 8.92, 8.06, 5.29, 10.32, 10.65]


class Detection:
    __slots__ = ("x", "y", "w", "h", "class_id", "score", "label")
    def __init__(self, x, y, w, h, class_id, score, label):
        self.x = x; self.y = y; self.w = w; self.h = h
        self.class_id = class_id
        self.score = score
        self.label = label


class Detector:
    def __init__(
        self, hash, labels,
        anchors=None,
        input_size=(224, 224),
        net_out_size=(7, 7),
        mean=None, norm=None,
    ):
        self.labels = list(labels)
        if anchors is None:
            anchors = DEFAULT_ANCHORS
        m = {
            "bin":   f"/root/model/{hash}.bin",
            "param": f"/root/model/{hash}.param",
        }
        options = {
            "model_type": "awnn",
            "inputs":  {"input0": (input_size[0], input_size[1], 3)},
            "outputs": {"output0": (net_out_size[0], net_out_size[1], (1 + 4 + len(labels)) * 5)},
            "mean":  mean or [127.5, 127.5, 127.5],
            "norm":  norm or [0.0078125, 0.0078125, 0.0078125],
        }
        self._model = nn.load(m, opt=options)
        self._decoder = decoder.Yolo2(
            len(labels), anchors,
            net_in_size=input_size, net_out_size=net_out_size,
        )
        self._input_size = input_size

    def detect(self, img, conf=0.5, iou=0.45):
        raw = self._model.forward(img.tobytes(), quantize=True, layout="hwc")
        boxes, probs = self._decoder.run(raw, nms=iou, threshold=conf, img_size=self._input_size)
        detections = []
        for box, info in zip(boxes, probs):
            cid = int(info[0])
            detections.append(Detection(
                x=float(box[0]), y=float(box[1]),
                w=float(box[2]), h=float(box[3]),
                class_id=cid,
                score=float(info[1][cid]) if cid < len(info[1]) else float(info[1].max()),
                label=self.labels[cid] if cid < len(self.labels) else str(cid),
            ))
        return detections

    def __del__(self):
        try:
            del self._model
            del self._decoder
        except Exception:
            pass
