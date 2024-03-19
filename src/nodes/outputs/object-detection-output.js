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

export const ObjectDetectionOutputNode = defineNode({
  type: "ObjectDetectionOutputNode",
  title: "Object Detection Output", 
  inputs: {
    modelOutput: () => new NodeInterface("Model Output", "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface("Validate Matrix", "mAP",[
        {text: "Mean Average Precision", value : "mAP"},
    ]).setPort(false),    
    saveMethod : () => new SelectInterface("Save Method", "Best value", 
      [
        {text: "Save best value", value : "best"},
        {text: "Save Last epoch", value : "last"},
        {text: "Best value after 1 of 3 epochs", value : "best_one_of_third"},        
        {text: "Best value after half epochs", value : "best_one_of_half"},
      ]).setPort(false),        
  },
  calculate({ modelOutput, validateMatrix, saveMethod }) {    
    return {
      result : {
        validateMatrix: validateMatrix,
        saveMethod: saveMethod,
        ...modelOutput,
      }
    };
  }
});
