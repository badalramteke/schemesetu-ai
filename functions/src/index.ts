import * as functions from "firebase-functions";
import * as express from "express";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const expressApp = express();

// Initialize Next.js
expressApp.all("*", (req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

// Deploy as Cloud Function
export const nextAppFunction = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    await nextApp.prepare();
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

// Alternative: Use onRequest for simpler setup
export const nextApp = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    expressApp(req, res);
  });
