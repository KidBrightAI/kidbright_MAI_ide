import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"
  
import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput } from "../interfaces/interface-types"

export const MobileNetNode = defineNode({
  type: "MobileNet",
  title: "Image classification model",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input").use(setType, modelInput),
    modelType : () => new SelectInterface("Model Type", "mobilenet-75", 
      [
        { text: "MobileNet-100", value : "mobilenet-100" },

        // { text: "MobileNet-75", value : "mobilenet-75" },
        // { text: "MobileNet-50", value : "mobilenet-50" },
        // { text: "MobileNet-25", value : "mobilenet-25" },
        // { text: "MobileNet-10", value : "mobilenet-10" },

      ]).setPort(false),                
  },
  outputs: {
    result: () => new NodeInterface("Model Output").use(setType, modelOutput),
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
