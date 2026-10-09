<script setup>
import { Translation as I18nT } from 'vue-i18n'
</script>

<template>
  <div class="hint">
    <div class="main-hint txt">
      <p class="p-color font-weight-bold">
        {{ $t('instructions.voice.capture.title') }}
      </p>
      <I18nT
        keypath="instructions.voice.capture.intro"
        tag="p"
        scope="global"
      >
        <template #button>
          <img
            src="@/assets/images/png/Group_200.png"
            alt=""
            srcset=""
          >
        </template>
      </I18nT>
    </div>
    <div class="mascot">
      <img
        src="@/assets/images/png/Mask_Group_11.png"
        alt=""
        srcset=""
      >
    </div>
  </div>
</template>
