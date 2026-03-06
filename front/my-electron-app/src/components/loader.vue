<template>
  <div class="loader-container">
    <div class="premium-loader"></div>
  </div>
</template>

<script>
export default {
  name: "Loader",
};
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.premium-loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(34, 197, 94, 0.1);
  border-left-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
