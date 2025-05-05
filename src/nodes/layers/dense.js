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
    activation : () => new SelectInterface("Activation", "relu",
    [
        { text: "relu", value : "relu" },
        { text: "sigmoid", value : "sigmoid" },
        { text: "tanh", value : "tanh" },
    ]).setPort(false),
    use_bias : () => new SelectInterface("Use Bias", true,
    [
        { text: "true", value : true },
        { text: "false", value : false },
    ]).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor)
  },
  calculate({ modelInput, output_nodes, activation, use_bias})  {
    let activationCode = "torch.nn." + activation.charAt(0).toUpperCase() + activation.slice(1) + "()";
    let dense = "torch.nn.Linear(" + modelInput.shape[1] + ", " + output_nodes + ", bias=" + use_bias + ")";
    if (modelInput.code) {
      dense = modelInput.code + "\n" + dense;
    }
    return {
      result: {
        ... modelInput,
        code : dense + "\n" + activationCode,
      }    
    }
  }
});