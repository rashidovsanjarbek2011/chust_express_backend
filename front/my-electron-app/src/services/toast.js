import { reactive } from "vue";

const state = reactive({
  toasts: [],
});

let idCounter = 0;

const remove = (id) => {
  const index = state.toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    state.toasts.splice(index, 1);
  }
};

const add = (message, type = "info", duration = 3000) => {
  const id = idCounter++;
  state.toasts.push({ id, message, type });
  if (duration > 0) {
    setTimeout(() => {
      remove(id);
    }, duration);
  }
};

export default {
  state,
  success(message, duration = 3000) {
    add(message, "success", duration);
  },
  error(message, duration = 4000) {
    add(message, "error", duration);
  },
  info(message, duration = 3000) {
    add(message, "info", duration);
  },
  warning(message, duration = 4000) {
    add(message, "warning", duration);
  },
  remove,
};
