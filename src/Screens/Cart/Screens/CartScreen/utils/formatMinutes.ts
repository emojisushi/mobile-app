export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let result = '';
  if (hours === 1) {
    result += `${hours} година`;
  } else if (hours > 1) {
    result += `${hours} годин`;
  }

  if (mins > 0) {
    if (hours > 0) {result += ' ';}
    result += `${mins} хвилин`;
  }
  return result;
};
