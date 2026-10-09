import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelInput } from "../interfaces/interface-types"
import { getDefault } from "@/engine/board-node-options"
import { t } from "@/plugins/i18n"

export const InputNode = defineNode({
  type: "InputNode",
  title: t("designer.node.input"),
  inputs: {
    train_split: () => new IntegerInterface(t("designer.field.trainSplit"), getDefault("InputNode", "train_split", 80), 1, 99).setPort(false),
    epochs: () => new IntegerInterface(t("designer.field.epochs"), getDefault("InputNode", "epochs", 100), 1, 1000).setPort(false),
    batch_size: () => new IntegerInterface(t("designer.field.batchSize"), getDefault("InputNode", "batch_size", 32), 2, 1024).setPort(false),
    learning_rate: () => new NumberInterface(t("designer.field.learningRate"), getDefault("InputNode", "learning_rate", 0.001), 0.0001, 0.1).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.modelInput")).use(setType, modelInput),
  },
  calculate({ train_split, epochs, batch_size, learning_rate }) {
    return {
      result : {
        train_split: train_split,
        epochs: epochs,
        batch_size: batch_size,
        learning_rate: learning_rate,        
      },
    }
  },
})
