import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface
} from "baklavajs";

import { setType } from "@baklavajs/interface-types";
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types";

export const Conv2dNode = defineNode({
  type: "Conv2d",
  title: "Convolutional Layer",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input | Tensor").use(setType, [modelInput, tensor]),
    filters : () => new IntegerInterface("Number of Filters", 2).setPort(false),
    kernel_size : () => new IntegerInterface("Kernel Size", 3).setPort(false),
    strides : () => new IntegerInterface("Strides", 1).setPort(false),
    padding : () => new SelectInterface("Padding", "same", 
    [
        { text: "valid", value : "valid" },
        { text: "same", value : "same" },
    ]).setPort(false),
    activation : () => new SelectInterface("Activation", "relu",
    [
        { text: "relu", value : "relu" },
        { text: "sigmoid", value : "sigmoid" },
        { text: "tanh", value : "tanh" },
        { text: "softmax", value : "softmax" },
        { text: "leaky_relu", value : "leaky_relu" },
        { text: "elu", value : "elu" },
        { text: "prelu", value : "prelu" },
    ]).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor)
  },
  calculate({ modelInput, filters, kernel_size, strides, padding, activation})  {
    let activationCode = "torch.nn.functional" + "." + activation + "()";
    let use_bias = true;
    if (activation === "softmax" || activation === "sigmoid") {
      use_bias = false;
    }
    let conv = "torch.nn.Conv2d(" + filters + ", " + kernel_size + ", " + strides + ", padding='" + padding + "', bias=" + use_bias + ")";
    if (modelInput.code) {
      conv = modelInput.code + "\n" + conv;
    }
    return {
      result: {
        ... modelInput,
        code : conv + "\n" + activationCode,
      }    
    }
  }
});