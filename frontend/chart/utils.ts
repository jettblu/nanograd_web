import { BLUE, PINK } from "@/constants/style";
import { IObservation } from "@/data/types";
import { isPositiveClass } from "@/network/utils";

/**
 * Get chart labels for an array of observations
 * @param observations observations to get labels for
 * @returns Class 1 or Class 0
 * @see isPositiveClass
 */

export function getChartLabel(observations: IObservation[]): string[] {
  return observations.map((o) => {
    return isPositiveClass(o) ? "Class 1" : "Class 0";
  });
}

/**
 * Get chart colors for an array of observations
 * @param observations observations to get colors for
 * @returns PINK or BLUE
 * @see isPositiveClass
 */
export function getChartColor(observations: IObservation[]) {
  return observations.map((o) => {
    return isPositiveClass(o) ? PINK : BLUE;
  });
}
