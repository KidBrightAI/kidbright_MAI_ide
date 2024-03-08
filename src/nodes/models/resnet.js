import {
    defineNode,
    NumberInterface,
    IntegerInterface,
    SelectInterface,
    NodeInterface
} from "baklavajs";
  
import { setType } from "@baklavajs/interface-types";
import { modelInput, modelOutput } from "../interfaces/interface-types";

export const ResnetNode = defineNode({
    type: "Renet",
    title: "Image classification model",
    inputs: {        
        modelInput : () => new NodeInterface("Model Input").use(setType, modelInput),
        modelType : () => new SelectInterface("Model Type", "Resnet18", ["Resnet18"]).setPort(false),        
        weights : () => new SelectInterface("Weights", "resnet18", ["resnet18", "random"]).setPort(false),
    },
    outputs: {
        result: () => new NodeInterface("Model Output").use(setType, modelOutput)
    },
    calculate({ modelInput, modelType, objectThreshold, iouThreshold, weights }) {
        return {
            type: "model",
            modelInput: modelInput,
            modelType: modelType,            
            weights: weights            
        }
    }
});
