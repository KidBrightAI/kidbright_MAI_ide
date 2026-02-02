import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"
  
import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput } from "../interfaces/interface-types"

export const YoloNode = defineNode({
  type: "YOLO",
  title: "Object detection model",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input").use(setType, modelInput),
    modelType : () => new SelectInterface("Model Type", "slim_yolo_v2", 
      [
        { text: "YOLO v2 slim", value : "slim_yolo_v2" },
      ]).setPort(false),
    objectThreshold : () => new NumberInterface("Object Threshold", 0.5, 0.1, 1).setPort(false),
    iouThreshold : () => new NumberInterface("IOU Threshold", 0.5, 0.1, 1).setPort(false),        
  },
  outputs: {
    result: () => new NodeInterface("Model Output").use(setType, modelOutput),
  },
  calculate({ modelInput, modelType, objectThreshold, iouThreshold, weights }) {
    return {
      result: {                                
        modelType: modelType,
        objectThreshold: objectThreshold,
        iouThreshold: iouThreshold,
        weights: weights,
        ... modelInput,
      },            
    }
  },
})
