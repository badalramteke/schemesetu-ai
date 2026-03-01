import functions from "firebase-functions";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let server: any;

export const nextApp = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => {
    return handle(req, res);
  });
});
