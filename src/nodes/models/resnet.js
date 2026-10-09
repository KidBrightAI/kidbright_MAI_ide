import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"
  
import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput } from "../interfaces/interface-types"
import { t } from "@/plugins/i18n"

export const ResnetNode = defineNode({
  type: "Renet",
  title: t("designer.node.imageClassification"),
  inputs: {        
    modelInput : () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
    modelType : () => new SelectInterface(t("designer.field.modelType"), "resnet18", 
      [
        { text: "Resnet-18", value : "resnet18" },
      ]).setPort(false),                
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.modelOutput")).use(setType, modelOutput),
  },
  calculate({ modelInput, modelType}) {
    return {
      result: {          
        modelType: modelType,
        ... modelInput,
      },            
    }
  },
})
