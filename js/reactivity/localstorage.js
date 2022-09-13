import { ref, watch } from '../reactivity.js';

export default function (key, defaultVal = null) {
  let data = localStorage.getItem(key);

  // If allready in localstorage, we parse the JSON
  if (data !== null) {
    try { data = JSON.parse(data) } catch (e) { data = defaultVal }
  // Or we set it at the default val and save it in the storage
  } else {
    data = defaultVal;
    localStorage.setItem(key, JSON.stringify(data));
  }

  const value = ref(data);
  // Every change of the data will be saved to the storage
  watch(value, () => {
    localStorage.setItem(key, JSON.stringify(value.value));
  });

  return value;
}