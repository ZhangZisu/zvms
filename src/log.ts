import { isMaster, worker } from "cluster";
import debug = require("debug");

export const log = debug("zvms:" + (isMaster ? "master" : "worker #" + worker.id));
