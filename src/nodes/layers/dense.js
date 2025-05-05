/*export default {
  name: "Dense",
  input: [
    {
      name: "input",
      accept: ["tensor"],
    },
  ],
  output: [
    {
      name: "output",
      type: "tensor",
    },
  ],
  options: [
    {
      name: "output_nodes",
      description: "Positive integer, dimensionality of the output space.",
      type: "number",
      default: 50,
    },
    {
      name: "activation",
      description:
        "Activation function to use. If you don't specify anything, no activation is applied",
      type: "string",
      options: ["relu", "sigmoid", "tanh"],
      default: "relu",
    },
    {
      name: "use_bias",
      description: "Boolean, whether the layer uses a bias vector",
      type: "boolean",
      default: true,
    },
  ],
  generator: (n) => {
    return "torch.nn.Linear(" + n.input[0].name + ".shape[1], " + n.options.output_nodes + ")" + (n.options.use_bias ? "" : ", bias=False") + "\n" +
      "torch.nn." + n.options.activation.charAt(0).toUpperCase() + n.options.activation.slice(1) + "()";
  },
};*/

import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface
} from "baklavajs";

import { setType } from "@baklavajs/interface-types";
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types";

export const DenseNode = defineNode({
  type: "Dense",
  title: "Dense Layer",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input | Tensor").use(setType, [modelInput, tensor]),
    output_nodes : () => new IntegerInterface("Output Nodes", 50).setPort(false),
    activation : () => new SelectInterface("Activation", "ReLU",
    [
      { text: "ReLU", value : "ReLU" },
        { text: "Sigmoid", value : "Sigmoid" },
        { text: "Tanh", value : "Tanh" },
        { text: "Softmax", value : "Softmax" },
    ]).setPort(false),
    use_bias : () => new SelectInterface("Use Bias", "True",
    [
        { text: "True", value : "True" },
        { text: "Talse", value : "False" },
    ]).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor)
  },
  calculate({ modelInput, output_nodes, activation, use_bias})  {
    let activationCode = "torch.nn." + activation + "()\n";
    let dense = "torch.nn.LazyLinear(out_features = " + output_nodes + ", bias=" + use_bias + ")\n";
    if (modelInput && modelInput.code) {
      dense = modelInput.code + dense;
    }
    return {
      result: {
        ... modelInput,
        code : dense + activationCode,
      }    
    }
  }
});