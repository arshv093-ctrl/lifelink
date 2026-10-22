import handleRequest from "../backend/dist/server.js";

export default function handler(req, res) {
  return handleRequest(req, res);
}
