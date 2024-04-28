import dayjs from "dayjs";

export const getAnalyticLabels = () => {
  const today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();
  const labels = [];

  for (let i = 0; i < 6; i++) {
    if (month === 11) {
      year--;
    }
    const label = dayjs(new Date(year, month, 1)).format("MMM YYYY");
    labels.push(label);
    month = (month + 11) % 12;
  }

  return labels.reverse();
};
