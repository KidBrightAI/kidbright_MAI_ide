"""Image classifier runtime for MaixCAM (CV181x).

Wraps `maix.nn.Classifier` behind a uniform API that matches the V831
runtime, so the Blockly generators (and the compiled Python) don't
branch per board. Board-side `.mud` already carries mean/scale/labels,
so this constructor is trivial.
"""
from maix import nn


class Classifier:
    def __init__(self, hash, labels, **_unused):
        self.labels = list(labels)
        self._model = nn.Classifier(
            model=f"/root/model/{hash}.mud",
            dual_buff=True,
        )

    def classify(self, img):
        result = self._model.classify(img)
        if not result:
            return {"label": "None", "class_id": -1, "probability": 0.0}
        idx = int(result[0][0])
        return {
            "label":       self.labels[idx] if idx < len(self.labels) else str(idx),
            "class_id":    idx,
            "probability": float(result[0][1]),
        }

    def __del__(self):
        try:
            del self._model
        except Exception:
            pass
