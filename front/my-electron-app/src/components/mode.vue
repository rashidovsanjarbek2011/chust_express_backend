<template>
  <button @click="toggleDarkMode" class=" relative flex justify content-between text-xl border-[2px] rounded-md dark:border-gray-700  bg-transparent px-[0.6em] gap-3 overflow-hidden h-[40px] items-center">
    <i class="bi bi-moon dark:text-black"></i>
    <i class="bi bi-brightness-high dark:text-white text-black"></i>
    <div v-if="isDark == true" class="activated h-[100%] w-[50%]  left-0 absolute bg-white z-[-1]"></div>
    <div v-if="isDark == false" class="activated h-[100%] right-0  w-[50%]  absolute bg-gray-200 z-[-1]"></div>
</button>
</template>

<script>
export default {
  data() {
    return {
      isDark: false,
    };
  },

  mounted() {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      this.isDark = true;
    }
  },
  methods: {
    toggleDarkMode() {
      const html = document.documentElement;
      html.classList.toggle("dark");
      this.isDark = html.classList.contains("dark");
      localStorage.theme = this.isDark ? "dark" : "light";
    },
  },
};
</script>
<style>
</style>