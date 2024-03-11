import {
    defineNode,
    NumberInterface,
    IntegerInterface,
    SelectInterface,
    NodeInterface
} from "baklavajs";
  
import { setType } from "@baklavajs/interface-types";
import { modelInput } from "../interfaces/interface-types";

export const InputNode = defineNode({
    type: "InputNode",
    title: "Input",
    inputs: {        
        inputWidth : () => new IntegerInterface("Width", 320).setPort(false),
        inputHeight : () => new IntegerInterface("Height", 240).setPort(false),
        train_split : () => new IntegerInterface("Train Split", 80, 1, 99).setPort(false),
        epochs : () => new IntegerInterface("Epochs", 100, 1, 1000).setPort(false),
        batch_size : () => new IntegerInterface("Batch Size", 32, 2, 1024).setPort(false),
        learning_rate : () => new NumberInterface("Learning Rate", 0.001, 0.0001, 0.1).setPort(false),
    },
    outputs: {
        result: () => new NodeInterface("Model Input").use(setType, modelInput)
    },
    calculate({ inputWidth, inputHeight, train_split, epochs, batch_size, learning_rate }) {
        return {
            result : {
                inputWidth: inputWidth,
                inputHeight: inputHeight,
                train_split: train_split,
                epochs: epochs,
                batch_size: batch_size,
                learning_rate: learning_rate        
            }
        }
    }
});
