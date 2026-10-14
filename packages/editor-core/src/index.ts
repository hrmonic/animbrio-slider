export {
  getActiveModule,
  getActiveSlide,
  mediaMap,
  ops,
  useEditorStore,
} from "./store.ts";
export type { EditorActions, EditorState } from "./store.ts";
export {
  addSlide,
  addTextLayer,
  alignLayers,
  deleteLayers,
  deleteSlide,
  duplicateLayers,
  groupLayers,
  moveLayer,
  mutateLayer,
  reorderSlides,
  resizeLayer,
  restoreRevision,
  setFontSize,
  setLayerKeyframe,
  setTextContent,
  ungroup,
} from "./ops.ts";
