import { MenuItem } from "../../types/menuItem";

export const primaryMenuItems: MenuItem[] = [
  { name: "Amministrazione", regExp: /^Amministrazione$/i },
  { name: "Novità", regExp: /^Novità$/i },
  { name: "Servizi", regExp: /^Servizi$/i },
  { name: "Vivere [nome del Comune]", regExp: /^Vivere /i },
];

export const secondaryMenuItems = {};
