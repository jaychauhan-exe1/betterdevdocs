export interface TestResult {
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  timeMs: number;
  error?: string | null;
}

export interface ConsoleOutputLine {
  type: "log" | "warn" | "error" | "info" | "system";
  text: string;
}

export interface ExecutionResult {
  logs: ConsoleOutputLine[];
  results: TestResult[];
  allPassed: boolean;
  timedOut: boolean;
  error?: string | null;
  durationMs: number;
}

export async function executeUserCode(
  userCode: string,
  testCases: Array<{ description: string; input: string; expectedOutput: string }>,
  timeoutMs: number = 3000
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    const workerScript = `
      self.onmessage = async function(e) {
        const { code, testCases } = e.data;
        const logs = [];

        const formatArg = (arg) => {
          if (arg === undefined) return "undefined";
          if (arg === null) return "null";
          if (typeof arg === "string") return arg;
          if (typeof arg === "function") return arg.toString();
          try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
        };

        const customConsole = {
          log: (...args) => logs.push({ type: "log", text: args.map(formatArg).join(" ") }),
          warn: (...args) => logs.push({ type: "warn", text: args.map(formatArg).join(" ") }),
          error: (...args) => logs.push({ type: "error", text: args.map(formatArg).join(" ") }),
          info: (...args) => logs.push({ type: "info", text: args.map(formatArg).join(" ") })
        };

        try {
          // 1. Run top-level user code
          const runner = new Function("console", code);
          const topRes = runner(customConsole);
          if (topRes instanceof Promise) await topRes;

          // 2. Evaluate sample test cases
          const results = [];
          let allPassed = true;

          for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const tcStart = performance.now();
            try {
              const evalCode = code + "\\n\\nreturn (" + tc.input + ");";
              const tcRunner = new Function("console", evalCode);
              const res = tcRunner({ log: () => {}, warn: () => {}, error: () => {}, info: () => {} });
              const resolved = res instanceof Promise ? await res : res;
              const tcEnd = performance.now();

              const actualVal = typeof resolved === "string" ? resolved : JSON.stringify(resolved);
              const expectedVal = tc.expectedOutput;
              const isPass = actualVal === expectedVal;
              if (!isPass) allPassed = false;

              results.push({
                description: tc.description,
                input: tc.input,
                expected: expectedVal,
                actual: actualVal ?? "undefined",
                passed: isPass,
                timeMs: Math.round((tcEnd - tcStart) * 10) / 10
              });

              logs.push({
                type: "system",
                text: "▶ Example " + (i + 1) + ": " + tc.input + " => " + (actualVal ?? "undefined")
              });
            } catch (tcErr) {
              const tcEnd = performance.now();
              allPassed = false;
              results.push({
                description: tc.description,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: "Error: " + (tcErr?.message || String(tcErr)),
                passed: false,
                timeMs: Math.round((tcEnd - tcStart) * 10) / 10,
                error: tcErr?.message || String(tcErr)
              });
              logs.push({
                type: "error",
                text: "▶ Example " + (i + 1) + ": " + tc.input + " => Error: " + (tcErr?.message || String(tcErr))
              });
            }
          }

          self.postMessage({ success: true, logs, results, allPassed });
        } catch (err) {
          self.postMessage({ success: false, error: err?.message || String(err), logs });
        }
      };
    `;

    let blob: Blob;
    let worker: Worker;

    try {
      blob = new Blob([workerScript], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    } catch {
      // Fallback if Blob workers are restricted
      resolve({
        logs: [{ type: "error", text: "Worker initialization failed." }],
        results: [],
        allPassed: false,
        timedOut: false,
        error: "Worker initialization failed",
        durationMs: 0,
      });
      return;
    }

    // 3-second Timeout Guardian for infinite loop protection
    const timer = setTimeout(() => {
      worker.terminate();
      const endTime = performance.now();
      resolve({
        logs: [
          {
            type: "error",
            text: `⚠️ Time Limit Exceeded (${timeoutMs}ms): Potential infinite loop or heavy computation detected. Code execution was safely terminated to prevent UI freezing.`,
          },
        ],
        results: testCases.map((tc) => ({
          description: tc.description,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: `Time Limit Exceeded (${timeoutMs}ms)`,
          passed: false,
          timeMs: timeoutMs,
          error: "Time Limit Exceeded",
        })),
        allPassed: false,
        timedOut: true,
        error: `Time Limit Exceeded (${timeoutMs}ms)`,
        durationMs: Math.round((endTime - startTime) * 10) / 10,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      const endTime = performance.now();
      const { success, logs, results, allPassed, error } = e.data;

      resolve({
        logs: logs || [],
        results: results || [],
        allPassed: Boolean(allPassed),
        timedOut: false,
        error: success ? null : error,
        durationMs: Math.round((endTime - startTime) * 10) / 10,
      });
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      const endTime = performance.now();
      resolve({
        logs: [
          {
            type: "error",
            text: `Runtime Error: ${e.message}`,
          },
        ],
        results: [],
        allPassed: false,
        timedOut: false,
        error: e.message,
        durationMs: Math.round((endTime - startTime) * 10) / 10,
      });
    };

    worker.postMessage({ code: userCode, testCases });
  });
}
