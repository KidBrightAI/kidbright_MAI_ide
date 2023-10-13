<template>
  <div class="rect-bbox" :style="{display: showRect?'block':'none'}" ref="bbox">
    <div
      class="rect unselect"
      :style="rectStyle"
      @mousedown.stop="readyForDrag(['x1', 'y1', 'x2', 'y2'])"
      @contextmenu="remove"
    >
      <div class="label-text">{{initRect.label}}</div>
    </div>
    <div
      v-show="resizeAble"
      class="anchor unselect anchor-start"
      :style="startStyle"
      @mousedown.stop="readyForDrag(['x1', 'y1'])"
    ></div>
    <div
      v-show="resizeAble"
      class="anchor unselect anchor-hv2"
      :style="hv2Style"
      @mousedown.stop="readyForDrag(['y1', 'x2'])"
    ></div>
    <div
      v-show="resizeAble"
      class="anchor unselect anchor-vh2"
      :style="vh2Style"
      @mousedown.stop="readyForDrag(['x1', 'y2'])"
    ></div>
    <div
      v-show="resizeAble"
      class="anchor unselect anchor-end"
      :style="endStyle"
      @mousedown.stop="readyForDrag(['x2', 'y2'])"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue';
const props = defineProps({
  initRect: {
    type: Object,
    default: () => {
      return {
        x1: -1,
        y1: -1,
        x2: -1,
        y2: -1
      };
    }
  },
  showRect: {
    type: Boolean,
    default: true
  },
  resizeAble: {
    type: Boolean,
    default: true
  },
  aspectRatio: {
    type: Number,
    default: undefined
  },
  minWidth: {
    type: Number,
    default: undefined
  },
  maxWidth: {
    type: Number,
    default: undefined
  },
  minHeight: {
    type: Number,
    default: undefined
  },
  maxHeight: {
    type: Number,
    default: undefined
  }
});

const emit = defineEmits(['changed', 'remove']);

const firstDrag = ref(true);
const directionMark = ref(1);

const x1 = ref(props.initRect.x1);
const y1 = ref(props.initRect.y1);
const x2 = ref(props.initRect.x2);
const y2 = ref(props.initRect.y2);
const modifyCoordinates = ref([]);
const bbox = ref({});
 // model: {
  //   prop: 'initRect',
  //   event: 'changed'
  // },
  // horizontal 简写h 代表横向， vertical 简写v 代表纵向
  // 分成两路，一路先横着走，然后竖着走，另外一路先竖着走，再横着走，
  // 最后都从start到达end
  // x1,y1  hv1    hv2
  // 口-----口-----口
  // |start        |
  // |             |
  // 口vh1         口 hv3
  // |             |
  // |             |
  // 口-----口-----口 end
  // vh2    vh3    x2,y2

const start = computed(() => {
  return { x: x1.value, y: y1.value };
});

const end = computed(() => {
  return { x: x2.value, y: y2.value };
});
const hv1 = computed(() => {
  let point = {
    x: (x1.value + x2.value) / 2,
    y: y1.value
  };
  return point;
});
const hv2 = computed(() => {
  let point = {
    x: x2.value,
    y: y1.value
  };
  return point;
});
const hv3 = computed(() => {
  let point = {
    x: x2.value,
    y: (y1.value + y2.value) / 2
  };
  return point;
});
const vh1 = computed(() => {
  let point = {
    x: x1.value,
    y: (y1.value + y2.value) / 2
  };
  return point;
});
const vh2 = computed(() => {
  let point = {
    x: x1.value,
    y: y2.value
  };
  return point;
});
const vh3 = computed(() => {
  let point = {
    x: (x1.value + x2.value) / 2,
    y: y2.value
  };
  return point;
});
const width = computed(() => {
  return Math.abs(x2.value - x1.value);
});
const height = computed(() => {
  return Math.abs(y2.value - y1.value);
});
const leftTopCorner = computed(() => {
  let leftTopCornerX = x1.value > x2.value ? x2.value : x1.value;
  let leftTopCornerY = y1.value > y2.value ? y2.value : y1.value;
  return { x: leftTopCornerX, y: leftTopCornerY };
});
const rightBottomCorner = computed(() => {
  let rightBottomCornerX = x1.value > x2.value ? x1.value : x2.value;
  let rightBottomCornerY = y1.value > y2.value ? y1.value : y2.value;
  return { x: rightBottomCornerX, y: rightBottomCornerY };
});
const leftBottomCorner = computed(() => {
  let leftBottomCornerX = x1.value > x2.value ? x2.value : x1.value;
  let leftBottomCornerY = y1.value > y2.value ? y1.value : y2.value;
  return { x: leftBottomCornerX, y: leftBottomCornerY };
});
const rightTopCorner = computed(() => {
  let rightTopCornerX = x1.value > x2.value ? x1.value : x2.value;
  let rightTopCornerY = y1.value > y2.value ? y2.value : y1.value;
  return { x: rightTopCornerX, y: rightTopCornerY };
});
const cursorMode = computed(() => {
  if ((x2.value - x1.value) * (y2.value - y1.value) > 0) {
    return 'mode1';
  } else {
    return 'mode2';
  }
});
const rectStyle = computed(() => {
  let style = {
    left: leftTopCorner.value.x + 'px',
    top: leftTopCorner.value.y + 'px',
    width: width.value + 'px',
    height: height.value + 'px',
    cursor: 'move',
    backgroundColor: props.initRect.color || '#0000002f',
  };
  return style;
});
const startStyle = computed(() => {
  let style = {
    left: start.value.x + 'px',
    top: start.value.y + 'px',
    cursor: cursorMode.value === 'mode1' ? 'nw-resize' : 'ne-resize'
  };
  return style;
});
const hv1Style = computed(() => {
  let style = {
    left: hv1.value.x + 'px',
    top: hv1.value.y + 'px',
    cursor: 'n-resize'
  };
  return style;
});
const hv2Style = computed(() => {
  let style = {
    left: hv2.value.x + 'px',
    top: hv2.value.y + 'px',
    cursor: cursorMode.value === 'mode1' ? 'ne-resize' : 'nw-resize'
  };
  return style;
});
const hv3Style = computed(() => {
  let style = {
    left: hv3.value.x + 'px',
    top: hv3.value.y + 'px',
    cursor: 'e-resize'
  };
  return style;
});
const vh1Style = computed(() => {
  let style = {
    left: vh1.value.x + 'px',
    top: vh1.value.y + 'px',
    cursor: 'e-resize'
  };
  return style;
});
const vh2Style = computed(() => {
  let style = {
    left: vh2.value.x + 'px',
    top: vh2.value.y + 'px',
    cursor: cursorMode.value === 'mode1' ? 'ne-resize' : 'nw-resize'
  };
  return style;
});
const vh3Style = computed(() => {
  let style = {
    left: vh3.value.x + 'px',
    top: vh3.value.y + 'px',
    cursor: 'n-resize'
  };
  return style;
});
const endStyle = computed(() => {
  let style = {
    left: end.value.x + 'px',
    top: end.value.y + 'px',
    cursor: cursorMode.value === 'mode1' ? 'nw-resize' : 'ne-resize'
  };
  return style;
});
const outX1 = computed(() => {
  return x1.value > x2.value ? x2.value : x1.value;
});
const outX2 = computed(() => {
  return x1.value > x2.value ? x1.value : x2.value;
});
const outY1 = computed(() => {
  return y1.value > y2.value ? y2.value : y1.value;
});
const outY2 = computed(() => {
  return y1.value > y2.value ? y1.value : y2.value;
});
const rightXName = computed(() => {
  return x1.value > x2.value ? 'x1' : 'x2';
});
const bottomYName = computed(() => {
  return y1.value > y2.value ? 'y1' : 'y2';
});
const innerMinHeight = computed(() => {
  if (props.minHeight) {
    return Math.max(props.minHeight, 0);
  }
  return 0;
});
const innerMaxHeight = computed(() => {
  let parent = bbox.value.parentElement;
  if (props.maxHeight) {
    return Math.min(props.maxHeight, parent.offsetHeight);
  }
  return parent.offsetHeight;
});
const innerMinWidth = computed(() => {
  if (props.minWidth) {
    return Math.max(props.minWidth, 0);
  } else {
    return 0;
  }
});
const innerMaxWidth = computed(() => {
  let parent = bbox.value.parentElement;
  if (props.maxWidth) {
    return Math.min(props.maxWidth, parent.offsetWidth);
  }
  return parent.offsetWidth;
});

//mothods
const remove = (e) => {
  emit('remove');
  e.preventDefault();
  return false;
};

const readyForDrag = (coordinates) => {
  firstDrag.value = true;
  let newCoordinate = reSort(coordinates);
  modifyCoordinates.value = newCoordinate;
  window.document.addEventListener('mousemove', doDrag);
};

const getTargetCoordinates = (movement) => {
  let modifyCoordinatesTemp = modifyCoordinates.value;
  let targetCoordinates = {};
  let targetWidth, targetHeight;
  let mainDirection;
  if (modifyCoordinatesTemp.length === 1) {
    mainDirection = modifyCoordinatesTemp[0];
    if (props.aspectRatio) {
      let subDirection = mainDirection === 'x2' ? 'y2' : 'x2';
      modifyCoordinatesTemp.push(subDirection);
    }
  } else {
    mainDirection = Math.abs(movement.movementX) < Math.abs(movement.movementY) ? 'y2' : 'x2';
  }
  modifyAspectRation(mainDirection, movement);
  let setTargetInfo = () => {
    targetCoordinates = { x1: x1.value, x2: x2.value, y1: y1.value, y2: y2.value };
    for (let coordinate of modifyCoordinatesTemp) {
      let target = coordinate == 'x1' ? x1.value : (coordinate == 'x2' ? x2.value : (coordinate == 'y1' ? y1.value : y2.value));
      targetCoordinates[coordinate] = target + movement['movement' + coordinate[0].toUpperCase()];
    }
    targetWidth = Math.abs(targetCoordinates.x2 - targetCoordinates.x1);
    targetHeight = Math.abs(targetCoordinates.y2 - targetCoordinates.y1);
  };
  setTargetInfo();
  let modifyMovementByDiff = (movement, moveDirction, diff) => {
    let movementDirection = 'movement' + moveDirction.toUpperCase();
    movement[movementDirection] = movement[movementDirection] > 0 ? (movement[movementDirection] - diff) : (movement[movementDirection] + diff);
    modifyAspectRation(moveDirction + '2', movement);
    setTargetInfo();
  };
  let validateMax = (target, max, direction) => {
    if (target > max) {
      let diff = target - max;
      modifyMovementByDiff(movement, direction, diff);
    }
  };
  let validateMin = (target, min, direction) => {
    if (target < min) {
      let diff = min - target;
      modifyMovementByDiff(movement, direction, diff);
    }
  };
  validateMax(targetWidth, innerMaxWidth.value, 'x');
  validateMin(targetWidth, innerMinWidth.value, 'x');
  validateMax(targetHeight, innerMaxHeight.value, 'y');
  validateMin(targetHeight, innerMinHeight.value, 'y');
  let parent = bbox.value.parentElement;
  let maxX = parent.offsetWidth;
  let minX = 0;
  let maxY = parent.offsetHeight;
  let minY = 0;
  validateMax(targetCoordinates.x2, maxX, 'x');
  validateMin(targetCoordinates.x2, minX, 'x');
  validateMax(targetCoordinates.y2, maxY, 'y');
  validateMin(targetCoordinates.y2, minY, 'y');
  if (modifyCoordinates.value.length === 4) {
    validateMax(targetCoordinates.x1, maxX, 'x');
    validateMin(targetCoordinates.x1, minX, 'x');
    validateMax(targetCoordinates.y1, maxY, 'y');
    validateMin(targetCoordinates.y1, minY, 'y');
  }
  return targetCoordinates;
};

const doDrag = (e) => {
  if (e.movementX === 0 && e.movementY === 0) {
    return;
  }
  if (firstDrag.value) {
    directionMark.value = 1;
    if ((x1.value === x2.value) && (y1.value === y2.value)) {
      let defaultX = 1;
      let defaultY = 1;
      let x = e.movementX || defaultX;
      let y = e.movementY || defaultY;
      if (x * y < 0) {
        directionMark.value = -1;
      }
    } else {
      if (
        (x2.value === rightTopCorner.value.x && y2.value === rightTopCorner.value.y) ||
        (x2.value === leftBottomCorner.value.x && y2.value === leftBottomCorner.value.y)
      ) {
        directionMark.value = -1;
      }
    }
  }
  firstDrag.value = false;
  let targetCoordinates = getTargetCoordinates({ movementX: e.movementX, movementY: e.movementY });
  x1.value = targetCoordinates.x1;
  x2.value = targetCoordinates.x2;
  y1.value = targetCoordinates.y1;
  y2.value = targetCoordinates.y2;
};

const modifyAspectRation = (direction, movement) => {
  if (props.aspectRatio) {
    let movementDirection = 'movement' + direction[0].toUpperCase();
    let movementValue = movement[movementDirection];
    let movementDirection2 = 'movement' + direction[1].toUpperCase();
    let movementValue2 = movement[movementDirection2];
    let movementValue2Abs = Math.abs(movementValue2);
    let movementValueAbs = Math.abs(movementValue);
    if (movementValue2Abs > movementValueAbs) {
      movement[movementDirection] = movementValue2Abs * directionMark.value;
    } else {
      movement[movementDirection2] = movementValueAbs * directionMark.value;
    }
  }
};
const getAgainstCoordinateName = (coordinateName) => {
  return coordinateName[1] === '1' ? (coordinateName[0] + '2') : (coordinateName[0] + '1');
}
const reSort = (coordinates) => {
  let originCoordinate = {
    x1: x1.value,
    x2: x2.value,
    y1: y1.value,
    y2: y2.value
  };
  let direction, endPointPartner;
  let newCoordinate = [];
  if (coordinates.length === 1) {
    direction = coordinates[0][0];
    endPointPartner = direction === 'x' ? bottomYName.value : rightXName.value;
    newCoordinate = [direction + '2'];
  }
  if (coordinates.length === 2) {
    direction = coordinates[0][0];
    endPointPartner = coordinates[1];
    newCoordinate = [coordinates[0][0] + '2', coordinates[1][0] + '2'];
  }
  if (coordinates.length === 4) {
    newCoordinate = coordinates;
  }
  if (coordinates.length !== 4) {
    if(direction === 'x'){
      x2.value = originCoordinate[coordinates[0]];
      x1.value = originCoordinate[getAgainstCoordinateName(coordinates[0])];
    }
    if(direction === 'y'){
      y2.value = originCoordinate[coordinates[0]];
      y1.value = originCoordinate[getAgainstCoordinateName(coordinates[0])];
    }
    if(endPointPartner[0] === 'x'){
      x2.value = originCoordinate[endPointPartner];
      x1.value = originCoordinate[getAgainstCoordinateName(endPointPartner)];
    }
    if(endPointPartner[0] === 'y'){
      y2.value = originCoordinate[endPointPartner];
      y1.value = originCoordinate[getAgainstCoordinateName(endPointPartner)];
    }
  }
  return newCoordinate;
};

const getResult = () => {
  let parent = bbox.value.parentElement;
  let maxX = parent.offsetWidth;
  let maxY = parent.offsetHeight;
  let x = outX1.value * 1000 / maxX;
  let y = outY1.value * 1000 / maxY;
  let result = {
    x1: x,
    y1: y,
    x: x,
    y: y,
    x2: outX2.value * 1000 / maxX,
    y2: outY2.value * 1000 / maxY,
    w: width.value * 1000 / maxX,
    h: height.value * 1000 / maxY,
    xpx: outX1.value,
    ypx: outY1.value,
    wpx: width.value,
    hpx: height.value,
    x1px: outX1.value,
    y1px: outY1.value,
    x2px: outX2.value,
    y2px: outY2.value,
    croperWidth: maxX,
    croperHeight: maxY
  };
  return result;
};

// computed
const leaveOrUp = () => {
  if (modifyCoordinates.value.length > 0) {
    let res = getResult();
    emit('changed',
      {
        x1 : res.x1px, 
        y1 : res.y1px, 
        x2: res.x2px, 
        y2: res.y2px,
        label : props.initRect.label,
        id : props.initRect.id
      });
  }
  modifyCoordinates.value = [];
  window.document.removeEventListener('mousemove', doDrag);
};
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

onMounted(() => {
  window.document.addEventListener('mouseup', leaveOrUp);
  window.document.addEventListener('mouseleave', leaveOrUp);
});

onUnmounted(() => {
  window.document.removeEventListener('mouseup', leaveOrUp);
  window.document.removeEventListener('mouseleave', leaveOrUp);
});

watch(props.initRect, (val, oldVal) => {
  x1.value = val.x1;
  y1.value = val.y1;
  x2.value = val.x2;
  y2.value = val.y2;
});

// watch(() => props.showRect, (val, oldVal) => {
//   if (val) {
//     x1.value = props.initRect.x1;
//     y1.value = props.initRect.y1;
//     x2.value = props.initRect.x2;
//     y2.value = props.initRect.y2;
//   }
// });
</script>
<style scoped>
.draw-panel {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: absolute;
}
.label-text{
  padding: 0px 5px;
  display: inline-block;
  background-color: white;
  font-size: 17px;
  font-weight: 600;
}
.crop-container {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.rect-box{
  width: 100%;
  height: 100%;
}
.cursor-crosshair {
  cursor: crosshair;
}

.rect {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  outline: 4px solid #39f;
  outline-color: rgba(51, 153, 255, 0.75);
  position: absolute;
}

.anchor {
  position: absolute;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  margin-left: -7px;
  background-color: #39f;
  border-radius: 0%;
  opacity: 0.75;
  border: none;
}

.unselect {
  -webkit-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -ms-user-select: none;
  /* 以下两个属性目前并未支持，写在这里为了减少风险 */
  -o-user-select: none;
  user-select: none;
}

.bg-rect {
  position: absolute;
  background-color: black;
  opacity: 0.3;
  margin: 0;
  padding: 0;
  border: 0;
}
</style>
