<template>
  <div class="hint">
    <div class="main-hint txt">
      <p class="p-color font-weight-bold">
        {{ $t('instructions.generic.coding.title') }}
      </p>
      <p>
        {{ $t('instructions.generic.coding.intro') }}<br><span class="p-color">{{ $t('instructions.generic.coding.step1') }}</span>
        <br><span class="p-color">{{ $t('instructions.generic.coding.step2') }}</span>
        <br><span class="p-color">{{ $t('instructions.generic.coding.step3') }}</span>
      </p>
      <p>
        <br><b>{{ $t('instructions.generic.coding.blocksTitle') }}</b>
        <ul>
          <li> * {{ $t('instructions.generic.coding.blockObject') }} </li>
          <li> * {{ $t('instructions.generic.coding.blockImage') }} </li>
          <li> * {{ $t('instructions.generic.coding.blockVoice') }} </li>
        </ul>
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
