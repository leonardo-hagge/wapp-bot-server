export function FormatDateToString(date: Date, withHour?: boolean) {
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();

  if (!withHour)
    return `${year}-${month}-${day}`;

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${year}-${(month + 1) < 10 ? '0' + (month + 1) : (month + 1)}-${day < 10 ? ('0' + day) : day} ${hours}:${minutes}:${seconds}`;
}