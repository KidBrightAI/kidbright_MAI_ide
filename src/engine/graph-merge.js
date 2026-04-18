/**
 * Apply board-specific default values onto an extension's default graph.
 *
 * Extensions ship a generic BaklavaJS graph (see extensions/*\/model-graph.json)
 * with sensible-but-board-unaware defaults. Each board declares its own
 * `modelDefaults[extensionId][nodeType][fieldName] = value` to override
 * those at project-creation time — so the student opens the model designer
 * with values tuned for their hardware (NPU memory, supported ops, etc.)
 * instead of having to know which knob to turn.
 *
 * Returns a new graph object; the input is not mutated.
 */
export function applyBoardDefaults(graph, extensionId, board) {
  const overrides = board?.modelDefaults?.[extensionId]
  if (!overrides || !graph?.graph?.nodes) return graph

  const cloned = JSON.parse(JSON.stringify(graph))
  for (const node of cloned.graph.nodes) {
    const nodePatch = overrides[node.type]
    if (!nodePatch) continue
    for (const [field, value] of Object.entries(nodePatch)) {
      if (node.inputs?.[field] && "value" in node.inputs[field]) {
        node.inputs[field].value = value
      }
    }
  }
  return cloned
}

/**
 * Reconcile a previously-saved graph against the board's current
 * `modelOptions` filter. Projects saved before the board declared its
 * `modelDefaults`/`modelOptions` may carry values (e.g. `mobilenet-100`
 * for V831) that are no longer in the allowed set — BaklavaJS would
 * render a dropdown whose current value isn't an item. For each such
 * field this function snaps the value back to the board's declared
 * default, so the designer opens with a valid selection and the
 * student isn't silently trained against an unsupported config.
 *
 * Returns a new graph object; the input is not mutated.
 */
export function reconcileWithBoard(graph, extensionId, board) {
  const defaults = board?.modelDefaults?.[extensionId]
  const options = board?.modelOptions?.[extensionId]
  if (!graph?.graph?.nodes || (!defaults && !options)) return graph

  const cloned = JSON.parse(JSON.stringify(graph))
  for (const node of cloned.graph.nodes) {
    const allowed = options?.[node.type]
    const nodeDefaults = defaults?.[node.type]
    if (!allowed) continue

    for (const [field, allowedValues] of Object.entries(allowed)) {
      const input = node.inputs?.[field]
      if (!input || !("value" in input)) continue
      if (!allowedValues.includes(input.value) && nodeDefaults?.[field] !== undefined) {
        input.value = nodeDefaults[field]
      }
    }
  }
  return cloned
}

/**
 * Apply the same snap-to-default rule to a flat trainConfig dict.
 * `trainConfig` is the computed output of the graph (what gets sent to
 * the training server); after reconcileWithBoard fixes the graph, this
 * keeps the persisted trainConfig coherent until ModelDesigner re-runs
 * computeGraph on mount.
 */
export function reconcileTrainConfig(trainConfig, extensionId, board) {
  const defaults = board?.modelDefaults?.[extensionId]
  const options = board?.modelOptions?.[extensionId]
  if (!trainConfig || (!defaults && !options)) return trainConfig

  const patched = { ...trainConfig }
  for (const nodeType of Object.keys(options ?? {})) {
    for (const [field, allowedValues] of Object.entries(options[nodeType])) {
      if (patched[field] !== undefined
          && !allowedValues.includes(patched[field])
          && defaults?.[nodeType]?.[field] !== undefined) {
        patched[field] = defaults[nodeType][field]
      }
    }
  }
  return patched
}
