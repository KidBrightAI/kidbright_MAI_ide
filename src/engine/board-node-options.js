/**
 * Runtime registry of board-scoped overrides for BaklavaJS node factories.
 *
 * BaklavaJS node types (e.g. ImageClassificationNode in `src/nodes/models/`)
 * are registered once globally at app startup — their SelectInterface items
 * and defaults are baked in at definition time and can't read the current
 * board. This module lets `workspace.selectProjectType()` publish a
 * (board, extension) context *before* the editor loads a graph; the node
 * factories then query by (nodeType, field) and get board-filtered choices.
 *
 * The scope is deliberately per-extension: the user is always inside one
 * extension at a time, so (nodeType, field) is unambiguous within that
 * scope. When the user switches extension or board, call `setBoardContext`
 * again before reloading the graph.
 */

let _defaults = {}
let _options = {}

export function setBoardContext(board, extensionId) {
  _defaults = board?.modelDefaults?.[extensionId] || {}
  _options = board?.modelOptions?.[extensionId] || {}
}

export function getDefault(nodeType, field, fallback) {
  return _defaults?.[nodeType]?.[field] ?? fallback
}

export function filterChoices(nodeType, field, allChoices) {
  const allowed = _options?.[nodeType]?.[field]
  if (!allowed) return allChoices
  return allChoices.filter(item => allowed.includes(item.value ?? item))
}
