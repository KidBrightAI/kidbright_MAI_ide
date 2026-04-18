"""Image classifier runtime for V831.

Wraps the AWNN `nn.load` pipeline behind a uniform `Classifier.classify(img)`
API that returns a plain dict with label/class_id/probability — matching what
the kidbright-mai-plus runtime returns so the Blockly generators (and the
user's block code) don't have to know which board is running underneath.
"""
from maix import nn


class Classifier:
    def __init__(
        self, hash, labels,
        input_size=(224, 224),
        mean=None, norm=None,
        first_layer_conv_no_pad=False,
    ):
        self.labels = list(labels)
        self.input_size = input_size
        m = {
            "bin":   f"/root/model/{hash}.bin",
            "param": f"/root/model/{hash}.param",
        }
        options = {
            "model_type": "awnn",
            "inputs":  {"input0": (input_size[0], input_size[1], 3)},
            "outputs": {"output0": (1, 1, len(labels))},
            "first_layer_conv_no_pad": first_layer_conv_no_pad,
            "mean":  mean or [127.5, 127.5, 127.5],
            "norm":  norm or [0.0078125, 0.0078125, 0.0078125],
        }
        self._model = nn.load(m, opt=options)

    def classify(self, img):
        result = self._model.forward(img, quantize=True)
        idx = int(result.argmax())
        return {
            "label":       self.labels[idx] if idx < len(self.labels) else str(idx),
            "class_id":    idx,
            "probability": float(result.max()),
        }

    def __del__(self):
        try:
            del self._model
        except Exception:
            pass
