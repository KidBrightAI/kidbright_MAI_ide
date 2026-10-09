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
import { modelOutput, tensor } from "../interfaces/interface-types"
import { t } from "@/plugins/i18n"

export const ClassificationOutputNode = defineNode({
  type: "ClassifiyOutputNode",
  title: t("designer.node.classificationOutput"), 
  inputs: {
    modelOutput: () => new NodeInterface(t("designer.field.modelOutputTensor"), "").use(setType, [modelOutput, tensor]),
    validateMatrix : () => new SelectInterface(t("designer.field.validateMatrix"), "val_accuracy",[
      {text: t("designer.option.validationAccuracy"), value : "val_accuracy"},
      {text: t("designer.option.validationLoss"), value : "val_loss"},
    ]).setPort(false),    
    saveMethod : () => new SelectInterface(t("designer.field.saveMethod"), "best", 
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
