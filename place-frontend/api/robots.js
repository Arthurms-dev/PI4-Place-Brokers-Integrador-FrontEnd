import { robots } from "../src/lib/seo.js";
import { baseDoSite } from "./_comum.js";

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.status(200).send(robots(baseDoSite(req)));
}
