import { 
    defineNode, 
    NodeInterface,
    IntegerInterface, 
    NumberInterface,
    SelectInterface,
    CheckboxInterface,
    TextInterface 
} from "baklavajs";

import { setType } from "@baklavajs/interface-types";
import { modelOutput } from "../interfaces/interface-types";

export const OutputNode = defineNode({
  type: "OutputNode",
  title: "Output",
  inputs: {
    value: () => new NodeInterface("Model Output", "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface("Validate Matrix", "mAP", ["mAP", "validation-accuracy", "validation-loss"]).setPort(false),
    saveMethod : () => new SelectInterface("Save Method", "Best value", ["Best value","Last epoch", "Best value after n epoch"]).setPort(false),    
  },
  outputs: {
    result: () => new NodeInterface("Output").use(setType, modelOutput).setPort(false),
  },
  calculate({ value, validateMatrix, saveMethod }) {
    return {
      result : {
        type: "output",
        validateMatrix: validateMatrix,
        saveMethod: saveMethod,
        model: value,
      }
    };
  }
});
