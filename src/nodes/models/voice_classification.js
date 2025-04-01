import {
    defineNode,
    NumberInterface,
    IntegerInterface,
    SelectInterface,
    NodeInterface
} from "baklavajs";
  
import { setType } from "@baklavajs/interface-types";
import { modelInput, modelOutput } from "../interfaces/interface-types";

export const VoiceClassifyNode = defineNode({
    type: "CNNVoice",
    title: "Voice Classification",
    inputs: {        
        modelInput : () => new NodeInterface("Model Input").use(setType, modelInput),    
        modelType : () => new SelectInterface("Model Type", "resnet18", 
          [
              { text: "Resnet-18", value : "resnet18" }
          ]).setPort(false),  
    },
    outputs: {
        result: () => new NodeInterface("Model Output").use(setType, modelOutput)
    },
    calculate({ modelInput, modelType }) {
        return {
            result: {          
                modelType: modelType,
                ... modelInput,
            }            
        }
    }
});
