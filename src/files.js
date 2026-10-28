import { readFile, writeFile, rename, stat, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { randomBytes } from "node:crypto";

export const MAX_BYTES = 256 * 1024 * 1024;

export class ToolError extends Error {
  constructor(message) {
    super(message);
    this.name = "ToolError";
  }
}

export function fullPath(value, label = "file path") {
  if (typeof value !== "string" || !value.trim()) throw new ToolError("Give a " + label + ".");
  let p = value.trim();
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) p = join(homedir(), p.slice(1));
  return resolve(p);
}

function fsMessage(e, path) {
  switch (e && e.code) {
    case "ENOENT":
      return "Nothing found at " + path + ".";
    case "EACCES":
    case "EPERM":
      return "Permission denied for " + path + ".";
    case "EISDIR":
      return path + " is a folder, not a file.";
    case "ENOSPC":
      return "The disk is full, so " + path + " could not be written.";
    case "EBUSY":
      return path + " is open in another program. Close it and try again.";
    case "EROFS":
      return path + " is on a read-only drive.";
    default:
      return "Could not use " + path + ": " + ((e && e.message) || e);
  }
}

export async function readInput(value, label = "file path") {
  const path = fullPath(value, label);
  let info;
  try {
    info = await stat(path);
  } catch (e) {
    throw new ToolError(e.code === "ENOENT" ? "File not found: " + path : fsMessage(e, path));
  }
  if (info.isDirectory()) throw new ToolError(path + " is a folder, not a file.");
  if (info.size > MAX_BYTES) throw new ToolError(path + " is larger than " + MAX_BYTES / 1024 / 1024 + " MB, which is more than Snowkit can open at once.");
  try {
    return { path, bytes: await readFile(path), size: info.size };
  } catch (e) {
    throw new ToolError(fsMessage(e, path));
  }
}

export async function readTextInput(value, label = "file path") {
  const file = await readInput(value, label);
  return { path: file.path, text: file.bytes.toString("utf8").replace(/^﻿/, "") };
}

export function besideInput(inputPath, suffix, ext) {
  const name = basename(inputPath, extname(inputPath));
  return join(dirname(inputPath), name + suffix + (ext === undefined ? extname(inputPath) : ext));
}

export async function existingFolder(value, label = "folder") {
  const path = fullPath(value, label);
  let info;
  try {
    info = await stat(path);
  } catch (e) {
    throw new ToolError(e.code === "ENOENT" ? "The folder " + path + " does not exist." : fsMessage(e, path));
  }
  if (!info.isDirectory()) throw new ToolError(path + " is a file, not a folder.");
  return path;
}

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (e) {
    if (e.code === "ENOENT") return false;
    throw new ToolError(fsMessage(e, path));
  }
}

export async function checkTargets(paths, overwrite) {
  for (const p of paths) {
    await existingFolder(dirname(p));
    let info = null;
    try {
      info = await stat(p);
    } catch (e) {
      if (e.code !== "ENOENT") throw new ToolError(fsMessage(e, p));
    }
    if (info && info.isDirectory()) throw new ToolError(p + " is a folder, not a file.");
    if (info && !overwrite) throw new ToolError(p + " already exists. Choose another output path, or set overwrite to true to replace it.");
  }
}

export async function writeOutput(value, data, { overwrite = false } = {}) {
  const path = fullPath(value, "output path");
  await checkTargets([path], overwrite);
  if (!overwrite) {
    try {
      await writeFile(path, data, { flag: "wx" });
    } catch (e) {
      if (e.code === "EEXIST") throw new ToolError(path + " already exists. Choose another output path, or set overwrite to true to replace it.");
      throw new ToolError(fsMessage(e, path));
    }
    return path;
  }
  const temp = join(dirname(path), "." + basename(path) + "." + randomBytes(4).toString("hex") + ".tmp");
  try {
    await writeFile(temp, data, { flag: "wx" });
    await rename(temp, path);
  } catch (e) {
    await unlink(temp).catch(() => {});
    throw new ToolError(fsMessage(e, path));
  }
  return path;
}

export function formatBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace(/\.0$/, "") + " KB";
  return (n / 1024 / 1024).toFixed(1).replace(/\.0$/, "") + " MB";
}
