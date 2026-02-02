import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types"

export const Conv2dNode = defineNode({
  type: "Conv2d",
  title: "Convolutional Layer",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input | Tensor").use(setType, [modelInput, tensor]),
    filters : () => new IntegerInterface("Number of Filters", 2).setPort(false),
    kernel_size : () => new IntegerInterface("Kernel Size", 3).setPort(false),
    strides : () => new IntegerInterface("Strides", 1).setPort(false),
    padding : () => new IntegerInterface("Padding", 0).setPort(false),
    activation : () => new SelectInterface("Activation", "ReLU",
      [
        { text: "ReLU", value : "ReLU" },
        { text: "Sigmoid", value : "Sigmoid" },
        { text: "Tanh", value : "Tanh" },
        { text: "Softmax", value : "Softmax" },
        { text: "LeakyReLU", value : "LeakyReLU" },
        { text: "ELU", value : "ELU" },
        { text: "PReLU", value : "PReLU" },
      ]).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor),
  },
  calculate({ modelInput, filters, kernel_size, strides, padding, activation})  {
    let activationCode = "torch.nn." + activation + "()\n"
    let use_bias = "True"
    if (activation === "Softmax" || activation === "Sigmoid") {
      use_bias = "False"
    }
    let conv = "torch.nn.LazyConv2d(" + filters + ", " + kernel_size + ", " + strides + ", padding=" + padding + ", bias=" + use_bias + ")\n"
    if (modelInput && modelInput.code) {
      conv = modelInput.code + conv
    }
    
    return {
      result: {
        ... modelInput,
        code : conv + activationCode,
      },    
    }
  },
})