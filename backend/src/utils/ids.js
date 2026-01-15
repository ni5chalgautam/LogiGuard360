import { v4 as uuidv4 } from "uuid";

export function makeId(prefix){
  const short = uuidv4().split("-")[0].toUpperCase();
  return `${prefix}-${short}`;
}
