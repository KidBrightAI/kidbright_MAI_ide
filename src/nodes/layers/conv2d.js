import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types"
import { t } from "@/plugins/i18n"

export const Conv2dNode = defineNode({
  type: "Conv2d",
  title: t("designer.node.conv2d"),
  inputs: {        
    modelInput : () => new NodeInterface(t("designer.field.modelInputTensor")).use(setType, [modelInput, tensor]),
    filters : () => new IntegerInterface(t("designer.field.numberOfFilters"), 2).setPort(false),
    kernel_size : () => new IntegerInterface(t("designer.field.kernelSize"), 3).setPort(false),
    strides : () => new IntegerInterface(t("designer.field.strides"), 1).setPort(false),
    padding : () => new IntegerInterface(t("designer.field.padding"), 0).setPort(false),
    activation : () => new SelectInterface(t("designer.field.activation"), "ReLU",
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
    result: () => new NodeInterface(t("designer.field.tensor")).use(setType, tensor),
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