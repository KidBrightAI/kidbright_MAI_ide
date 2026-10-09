<script setup>
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      error-code="404"
      :error-title="$t('page.notFound.title')"
      :error-description="$t('page.notFound.description')"
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VBtn
        to="/"
        class="mt-10"
      >
        {{ $t('page.notFound.backHome') }}
      </VBtn>
    </div>
    <!-- 👉 Footer -->
  </div>
</template>

<style lang="scss">
@use "@core/scss/pages/misc.scss";

.misc-footer-tree {
  inline-size: 15.625rem;
  inset-block-end: 3.5rem;
  inset-inline-start: 0.375rem;
}
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
