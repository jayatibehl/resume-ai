import api from "./api";

export const registerUser = async (data) => {
  return await api.post("/register", data);
};

export const loginUser = async (data) => {
  return await api.post("/login", data);
};