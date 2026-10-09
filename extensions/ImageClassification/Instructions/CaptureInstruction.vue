<script setup>
import { Translation as I18nT } from 'vue-i18n'
</script>

<template>
  <div class="hint">
    <div class="main-hint txt notype">
      <p class="p-color font-weight-bold">
        {{ $t('instructions.image.capture.title') }}
      </p>
      <p>
        <I18nT
          keypath="instructions.image.capture.intro"
          scope="global"
        >
          <template #button>
            <img
              src="@/assets/images/png/Group_113.png"
              alt=""
              srcset=""
            >
          </template>
        </I18nT>
        <br> {{ $t('instructions.image.capture.note') }}
      </p>
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
