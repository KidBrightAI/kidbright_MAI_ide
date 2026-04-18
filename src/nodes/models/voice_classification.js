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

const MODEL_TYPES = [
  { text: "Voice CNN (Recommended)", value: "voice-cnn" },
  { text: "Resnet-18", value: "resnet18" },
]

export const VoiceClassifyNode = defineNode({
  type: "CNNVoice",
  title: "Voice Classification",
  inputs: {
    modelInput: () => new NodeInterface("Model Input").use(setType, modelInput),
    modelType: () => new SelectInterface(
      "Model Type",
      getDefault("CNNVoice", "modelType", "voice-cnn"),
      filterChoices("CNNVoice", "modelType", MODEL_TYPES),
    ).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Model Output").use(setType, modelOutput),
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
