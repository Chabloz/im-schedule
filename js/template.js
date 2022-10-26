import { getNodes, forEach } from './dom.js';

// Initial load of all the templates in the default document
const templates = new Map();
const tmplNodes = getNodes('[data-tmpl-id]');
for (const tmplNode of tmplNodes) {
  const id = tmplNode.dataset.tmplId;
  const tmpl = tmplNode.cloneNode(true);
  tmpl.removeAttribute('data-role');
  templates.set(id, tmpl);
}

export default function generate(id, data = null) {
  const tmpl = templates.get(id);
  const dom = tmpl.cloneNode(true);
  for (const prop in data) {
    forEach(`[data-tmpl-ph="${prop}"]`, ele => ele.textContent = data[prop], dom);
  }
  // single node template management
  if (getNodes(`[data-tmpl-ph]`, dom).length == 0 && data) {
    dom.textContent = data;
  }
  return dom;
}
