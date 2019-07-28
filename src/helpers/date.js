/**
 *
 * @param date {date} - instance of Date
 * @param minutes {number} - number of minutes to add
 * @returns {date} - new Date instance
 */
export const addMinutes = (date, minutes) => {
  const newDate = new Date(date); // don't modify passed date, instead create and return new one
  newDate.setTime(newDate.getTime() + (minutes * 60 * 1000));

  return newDate;
};
