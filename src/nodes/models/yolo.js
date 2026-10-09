import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput } from "../interfaces/interface-types"
import { getDefault, filterChoices } from "@/engine/board-node-options"
import { t } from "@/plugins/i18n"

const MODEL_TYPES = [
  { text: "YOLO v2 slim", value: "slim_yolo_v2" },
  { text: t("designer.option.yolo11nSpeed"), value: "yolo11n" },
  { text: t("designer.option.yolo11sAccuracy"), value: "yolo11s" },
]

export const YoloNode = defineNode({
  type: "YOLO",
  title: t("designer.node.objectDetection"),
  inputs: {
    modelInput: () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
    modelType: () => new SelectInterface(
      "Model Type",
      getDefault("YOLO", "modelType", "yolo11n"),
      filterChoices("YOLO", "modelType", MODEL_TYPES),
    ).setPort(false),
    objectThreshold: () => new NumberInterface(t("designer.field.objectThreshold"), 0.5, 0.1, 1).setPort(false),
    iouThreshold: () => new NumberInterface(t("designer.field.iouThreshold"), 0.5, 0.1, 1).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.modelOutput")).use(setType, modelOutput),
  },
  calculate({ modelInput, modelType, objectThreshold, iouThreshold, weights }) {
    return {
      result: {
        modelType: modelType,
        objectThreshold: objectThreshold,
        iouThreshold: iouThreshold,
        weights: weights,
        ...modelInput,
      },
    }
  },
})
