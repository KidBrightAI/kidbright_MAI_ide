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

export const ClassificationOutputNode = defineNode({
  type: "ClassifiyOutputNode",
  title: "Classification Output", 
  inputs: {
    modelOutput: () => new NodeInterface("Model Output", "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface("Validate Matrix", "val_accuracy",[
        {text: "Validation Accuracy", value : "val_accuracy"},
        {text: "Validation Loss", value : "val_loss"},
    ]).setPort(false),    
    saveMethod : () => new SelectInterface("Save Method", "best", 
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
