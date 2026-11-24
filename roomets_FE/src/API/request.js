import { register } from "./authAPI";

export function createUser(form) {
  return register(form);
}
