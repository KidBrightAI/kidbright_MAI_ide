import { 
  defineNode, 
  NodeInterface,
  IntegerInterface, 
  NumberInterface,
  SelectInterface,
  CheckboxInterface,
  TextInterface, 
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelOutput } from "../interfaces/interface-types"

export const OutputNode = defineNode({
  type: "OutputNode",
  title: "Output", 
  inputs: {
    modelOutput: () => new NodeInterface("Model Output", "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface("Validate Matrix", "val_accuracy",[
      {text : "Mean Average Precision", value : "mAP"},
      {text: "Validation Accuracy", value : "val_accuracy"},
      {text: "Validation Loss", value : "val_loss"},
    ]).setPort(false),
    saveMethod : () => new SelectInterface("Save Method", "best", 
      [
        {text: "Best value", value : "best"},
        {text: "Last epoch", value : "last"},
        {text: "Best value after n epoch", value : "best_after_n"},
      ]).setPort(false),        
  },
  calculate({ modelOutput, validateMatrix, saveMethod }) {        
    return {
      result : {
        validateMatrix: validateMatrix,
        saveMethod: saveMethod,
        ...modelOutput,
      },
    }
  },
})
