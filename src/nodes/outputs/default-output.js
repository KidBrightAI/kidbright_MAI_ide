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

export const OutputNode = defineNode({
  type: "OutputNode",
  title: t("designer.node.output"), 
  inputs: {
    modelOutput: () => new NodeInterface(t("designer.field.modelOutput"), "").use(setType, modelOutput),
    validateMatrix : () => new SelectInterface(t("designer.field.validateMatrix"), "val_accuracy",[
      {text : "Mean Average Precision", value : "mAP"},
      {text: t("designer.option.validationAccuracy"), value : "val_accuracy"},
      {text: t("designer.option.validationLoss"), value : "val_loss"},
    ]).setPort(false),
    saveMethod : () => new SelectInterface(t("designer.field.saveMethod"), "best", 
      [
        {text: t("designer.option.bestValue"), value : "best"},
        {text: t("designer.option.lastEpoch"), value : "last"},
        {text: t("designer.option.bestAfterN"), value : "best_after_n"},
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
