export class Vehicle {
  lp: string;
  manufacturer: string;
  type: string;
  consumption: string;
  fuelType: string;
  year: string;

  constructor(options: any = {}) {
    this.lp = options.lp || "";
    this.manufacturer = options.manufacturer || "";
    this.type = options.type || "";
    this.consumption = options.consumption || "";
    this.fuelType = options.fuelType || "";
    this.year = options.year || "";
  }
}

export const Fuels: string[] = [
  "diesel",
  "gasoline",
  "hybrid",
  "electric"
];
