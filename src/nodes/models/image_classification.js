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
  { text: "MobileNet-100", value: "mobilenet-100" },
  { text: "MobileNet-75", value: "mobilenet-75" },
  { text: "MobileNet-50", value: "mobilenet-50" },
  { text: "MobileNet-25", value: "mobilenet-25" },
  { text: "MobileNet-10", value: "mobilenet-10" },
  { text: "Resnet-18", value: "resnet18" },
]

export const ImageClassificationNode = defineNode({
  type: "ImageClassification",
  title: t("designer.node.imageClassification"),
  inputs: {
    modelInput: () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
    modelType: () => new SelectInterface(
      "Model Type",
      getDefault("ImageClassification", "modelType", "mobilenet-100"),
      filterChoices("ImageClassification", "modelType", MODEL_TYPES),
    ).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.modelOutput")).use(setType, modelOutput),
  },
  calculate({ modelInput, modelType }) {
    return {
      result: {
        modelType: modelType,
        ...modelInput,
      },
    }
  },
})