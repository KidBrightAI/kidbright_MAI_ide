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
  { text: t("designer.option.voiceCnnRecommended"), value: "voice-cnn" },
  { text: "Resnet-18", value: "resnet18" },
]

export const VoiceClassifyNode = defineNode({
  type: "CNNVoice",
  title: t("designer.node.voiceClassification"),
  inputs: {
    modelInput: () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
    modelType: () => new SelectInterface(
      "Model Type",
      getDefault("CNNVoice", "modelType", "voice-cnn"),
      filterChoices("CNNVoice", "modelType", MODEL_TYPES),
    ).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.modelOutput")).use(setType, modelOutput),
  },
  calculate({ modelInput, modelType }) {
    return {
      result: {          
        modelType: modelType,
        ... modelInput,
      },            
    }
  },
})
