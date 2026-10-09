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

export const MobileNetNode = defineNode({
  type: "MobileNet",
  title: t("designer.node.imageClassification"),
  inputs: {        
    modelInput : () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
    modelType : () => new SelectInterface(t("designer.field.modelType"), "mobilenet-75", 
      [
        { text: "MobileNet-100", value : "mobilenet-100" },

        // { text: "MobileNet-75", value : "mobilenet-75" },
        // { text: "MobileNet-50", value : "mobilenet-50" },
        // { text: "MobileNet-25", value : "mobilenet-25" },
        // { text: "MobileNet-10", value : "mobilenet-10" },

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
