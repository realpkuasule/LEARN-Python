import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 65_536;

export const buildDockerArgs = (code) => [
  "run",
  "--rm",
  "--interactive",
  "--network",
  "none",
  "--memory",
  "256m",
  "--cpus",
  "0.5",
  "--pids-limit",
  "64",
  "--read-only",
  "--tmpfs",
  "/tmp:rw,noexec,nosuid,size=16m",
  "--cap-drop",
  "ALL",
  "--security-opt",
  "no-new-privileges",
  "python:3.12-alpine",
  "python",
  "-I",
  "-c",
  code,
];

const appendOutput = (current, chunk) => (
  Buffer.concat([current, chunk]).subarray(0, MAX_OUTPUT_BYTES)
);

export const runPython = (code, options = {}) => new Promise((resolve, reject) => {
  const startedAt = performance.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const child = (options.spawnProcess ?? spawn)("docker", buildDockerArgs(code), {
    stdio: ["pipe", "pipe", "pipe"],
  });
  let stdout = Buffer.alloc(0);
  let stderr = Buffer.alloc(0);
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill("SIGKILL");
  }, timeoutMs);

  child.stdout.on("data", (chunk) => {
    stdout = appendOutput(stdout, chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr = appendOutput(stderr, chunk);
  });
  child.on("error", (error) => {
    clearTimeout(timeout);
    reject(error);
  });
  child.on("close", () => {
    clearTimeout(timeout);
    resolve({
      stdout: stdout.toString("utf8"),
      stderr: stderr.toString("utf8"),
      durationMs: Math.min(Math.round(performance.now() - startedAt), timeoutMs),
      timedOut,
    });
  });
  child.stdin.end(options.stdin ?? "");
});
