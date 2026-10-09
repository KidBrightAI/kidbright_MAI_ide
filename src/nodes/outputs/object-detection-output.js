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
import { t } from "@/plugins/i18n"

export const ObjectDetectionOutputNode = defineNode({
  type: "ObjectDetectionOutputNode",
  title: t("designer.node.objectDetectionOutput"), 
  inputs: {
    modelOutput: () => new NodeInterface(t("designer.field.modelOutput"), "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface(t("designer.field.validateMatrix"), "mAP",[
      {text: t("designer.option.meanAveragePrecision"), value : "mAP"},
    ]).setPort(false),    
    saveMethod : () => new SelectInterface(t("designer.field.saveMethod"), "Best value", 
      [
        {text: t("designer.option.saveBestValue"), value : "best"},
        {text: t("designer.option.saveLastEpoch"), value : "last"},
        {text: t("designer.option.bestAfterThird"), value : "best_one_of_third"},        
        {text: t("designer.option.bestAfterHalf"), value : "best_one_of_half"},
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
