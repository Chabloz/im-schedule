export async function xml(url, options = {}) {
  const response = await fetch(url, options);
  const xml = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
}

export async function json(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}