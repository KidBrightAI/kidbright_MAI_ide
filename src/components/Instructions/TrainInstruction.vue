<script setup>
import { Translation as I18nT } from 'vue-i18n'
</script>

<template>
  <div class="hint">
    <div class="main-hint txt">
      <p class="p-color font-weight-bold">
        {{ $t('instructions.generic.train.title') }}<br>
      </p>
      <p>{{ $t('instructions.generic.train.intro') }}</p>
      <p>
        <br>
        <I18nT
          keypath="instructions.generic.train.step1"
          scope="global"
        >
          <template #train>
            <span class="p-color">{{ $t('instructions.labels.train') }}</span>
          </template>
        </I18nT>
      </p>
      <p>
        <br>
        <I18nT
          keypath="instructions.generic.train.step2"
          scope="global"
        >
          <template #download>
            <span class="p-color">{{ $t('instructions.labels.download') }}</span>
          </template>
        </I18nT>
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
