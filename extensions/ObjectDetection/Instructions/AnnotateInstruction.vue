<script setup>
import { Translation as I18nT } from 'vue-i18n'
</script>

<template>
  <div class="hint">
    <div class="main-hint txt">
      <p class="p-color font-weight-bold">
        {{ $t('instructions.object.annotate.title') }}
      </p>
      <p>{{ $t('instructions.object.annotate.intro') }}</p>
      <p>
        <br>
        <I18nT
          keypath="instructions.object.annotate.step1"
          scope="global"
        >
          <template #button>
            <img
              src="@/assets/images/png/Group_97.png"
              alt=""
              srcset=""
            >
          </template>
        </I18nT>
      </p>
      <p>
        <br>
        <I18nT
          keypath="instructions.object.annotate.step2"
          scope="global"
        >
          <template #box>
            <img
              src="@/assets/images/png/Group_96.png"
              alt=""
              srcset=""
            >
          </template>
        </I18nT>
      </p>
      <p>
        <br>
        <I18nT
          keypath="instructions.object.annotate.step3"
          scope="global"
        >
          <template #button>
            <img
              src="@/assets/images/png/interface.png"
              alt=""
              srcset=""
            >
          </template>
        </I18nT>
      </p>
      <p>
        <br> {{ $t('instructions.object.annotate.note') }}
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
