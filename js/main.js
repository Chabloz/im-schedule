import * as Dom from './dom.js';
import * as Fetch from './fetch.js';
import {schedule, classId, showHistory, allCourses, course, allClasses} from './store.js';
import {dateToFrCh, dateToHours} from './date.js';
import template from './template.js';
import {watch, computed, nextTick} from './reactivity.js';
import conf from './conf.js';

// Filter schedule by class
const scheduleFilteredByClass = computed(() => {
  if (classId.value == conf.allClassesFilter) return schedule.value;
  return schedule.value.filter(event => event.class == classId.value);
});

// Filter schedule by course
const scheduleFilteredByCourse = computed(() => {
  if (course.value == conf.allCoursesFilter) return scheduleFilteredByClass.value;
  return scheduleFilteredByClass.value.filter(event => event.label == course.value);
});

// Hide old events from the schedule
const scheduleHistory =  computed(() => {
  if (showHistory.value) return scheduleFilteredByCourse.value;
  const now = (new Date()).toISOString();
  return scheduleFilteredByCourse.value.filter(event => event.end >= now);
});

// Schedule ordered by date
const scheduleByDate = computed(() => {
  return scheduleHistory.value.sort((c1, c2) => c1.start.localeCompare(c2.start));
});

// Remove the loading modal when the schedule is loaded
const unwatch = watch(schedule, () => {
  if (schedule.value?.length > 0) {
    Dom.getNode('#loading')?.remove();
    unwatch();
  }
});

// When classId or allClasses change, toggle the selected btn state
watch([classId, allClasses], async () => {
  // We wait for next tick to be sure the btn DOM is updated
  await nextTick();
  Dom.forEach(`.selected`, node => node.classList.remove('selected'));
  Dom.getNode(`[data-class-id='${classId.value}']`)?.classList.add('selected');
});

// Update DOM for classes button
watch(allClasses, () => {
  const nodes = allClasses.value.map(classe => {
    const node = template('btn-schedule', classe);
    node.dataset.classId = classe;
    return node;
  })
  Dom.getNode('#actions')?.replaceChildren(...nodes);
});

// Update the courses DOM <select> on courses changes
watch(allCourses, () => {
  const nodes = allCourses.value.map(theCourse => {
    const node = template('option-course', theCourse);
    // Automaticly select the choosen course on page load
    if (theCourse == course.value) node.selected = true;
    return node;
  });
  Dom.getNode('#input-filter-courses')?.replaceChildren(...nodes);
});

// Update the schedule DOM on schedule change
watch(scheduleByDate, () => {
  Dom.getNode('#no-results')?.replaceChildren(
    scheduleByDate.value.length < 1 ? template('no-results') : []
  );
  const nodes = scheduleByDate.value.map(event => template('event', {
    ...event,
    room: event.room.replaceAll(', ', ' '),
    'date-fr': dateToFrCh(new Date(event.start)),
    'start-fr': dateToHours(new Date(event.start)),
    'end-fr': dateToHours(new Date(event.end)),
  }));
  Dom.getNode('#schedule')?.replaceChildren(...nodes);
});

// Set the classId on button click
Dom.delegateOn('#actions', '.btn-schedule', 'click', evt => classId.value = evt.target.dataset.classId);
// Set the showHistory state on checkbox input change
Dom.on('#input-show-old-courses', 'input', evt => showHistory.value = evt.currentTarget.checked);
// Set the selected couurse state for filtering on <select> input change
Dom.on('#input-filter-courses', 'input', evt => course.value = evt.currentTarget.value);

// Installation and detecting change of the service worker
navigator.serviceWorker.register('sw.js');
navigator.serviceWorker.addEventListener('controllerchange', async () => {
  Dom.getNode('#container').replaceChildren(template('activated'));
});

// Refresh schedule on visibility change (and refresh the Service Worker cache)
document.addEventListener('visibilitychange', evt => {
  if (document.hidden) return;
  if (!navigator.onLine) return;
  Fetch.json(conf.scheduleJson, {cache: 'reload'}).then(data => schedule.value = data);
});