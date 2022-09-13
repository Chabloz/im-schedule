const mapDay = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function dateToFrCh(date) {
  let day = date.getDate();
  const dayName = mapDay[date.getDay()];
  let month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  return `${dayName} ${day}.${month}`;
}

export function dateToHours(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  return `${hours}:${minutes}`;
}