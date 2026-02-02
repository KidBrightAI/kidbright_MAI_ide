export default {
  name: "Dropout",
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
      name: "rate",
      description:
        "Number between 0 and 1. Fraction of the input units to drop.",
      type: "float",
      default: 0.5,
    },
  ],
  generator: n => {
    return "torch.nn.Dropout(" + n.options.rate + ")"
  },
}