export type WorkingHours = [[number, number], [number, number]];

export const appConfig = {
  workingHours: [
    [0, 1],
    [23, 59],
  ] as WorkingHours,
  onlinePaymentHours: [
    [0, 1],
    [23, 59],
  ] as WorkingHours,
};
