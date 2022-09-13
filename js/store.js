import conf from './conf.js';
import * as Fetch from './fetch.js';
import {ref, computed, watch} from './reactivity.js';
import refLocalstorage from './reactivity/localstorage.js';

// Intial fetch of the schedule (with cache management in the service worker 'sw.js')
export const schedule = ref([]);
Fetch.json(conf.scheduleJson).then(data => schedule.value = data);

// "show history" is saved in localStorage
export const showHistory = refLocalstorage('showHistory', false);

// The courses list is computed from an extract of the course name in the schedule
export const allCourses = computed(() => {
  let courses = schedule.value.map(event => event.label); // take only course name
  courses = [...new Set(courses)]; // remove duplicate
  courses.sort((c1, c2) => c1.localeCompare(c2)); // Alphabetical sort
  return [conf.allCoursesFilter, ...courses]; // Add the "All courses" at the beginning
});

// The classes list is computed from an extract of the class name in the schedule
export const allClasses = computed(() => {
  let classes = schedule.value.map(event => event.class); // take only class name
  classes = [...new Set(classes)]; // remove duplicate
  classes.sort((c1, c2) => c1.localeCompare(c2)); // Alphabetical sort
  return [conf.allClassesFilter, ...classes]; // Add the "All classes" at the beginning
});

// classId is saved in localStorage
export const classId = refLocalstorage('classId', conf.allClassesFilter);
// If not a valid class, reset it to the default one (show all classes)
watch(allClasses, () => {
  if (allClasses.value.includes(classId.value)) return;
  classId.value = conf.allClassesFilter;
});

// The selected course for filtering is saved in localStorage
export const course = refLocalstorage('course', conf.allCoursesFilter);
// If not a valide course, reset it to the default one (show all courses)
watch(allCourses, () => {
  if (allCourses.value.includes(course.value)) return;
  course.value = conf.allCoursesFilter;
});