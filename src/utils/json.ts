// Helper to escape literal newlines inside double-quoted string values (common VLM JSON bug)
export function sanitizeJsonString(rawJson: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < rawJson.length; i++) {
    const char = rawJson[i];
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    if (char === "\\") {
      result += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString && char === "\n") {
      result += "\\n";
      continue;
    }
    if (inString && char === "\r") {
      result += "\\r";
      continue;
    }
    result += char;
  }
  return result;
}

// Helper to systematically repair truncated JSON blocks generated due to token cutoff limits
export function repairTruncatedJson(rawJson: string): string {
  let result = rawJson.trim();
  if (!result) return "{}";

  let inString = false;
  let escape = false;
  let expectingValue = false;
  const stack: string[] = [];

  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
        expectingValue = false;
      } else if (char === "}" || char === "]") {
        const last = stack[stack.length - 1];
        if ((char === "}" && last === "{") || (char === "]" && last === "[")) {
          stack.pop();
        }
      } else if (char === ":") {
        expectingValue = true;
      } else if (char === ",") {
        expectingValue = false;
      }
    }
  }

  // Case 1: Already balanced and closed
  if (stack.length === 0 && !inString) {
    return result;
  }

  // Case 2: Truncated inside a string value/key
  if (inString) {
    const insideArray = stack[stack.length - 1] === "[";
    if (insideArray || expectingValue) {
      // Truncated inside a value
      result += '"';
      while (stack.length > 0) {
        const last = stack.pop();
        if (last === "{") result += "}";
        else if (last === "[") result += "]";
      }
      return result;
    } else {
      // Truncated inside an object key - treat as not in string and fall through to slice it off
      inString = false;
    }
  }

  // Case 3: Truncated outside a string (e.g. trailing comma or incomplete key)
  result = result.trim();
  if (result.endsWith(",")) {
    result = result.slice(0, -1).trim();
  }

  // Detect and slice off any half-written trailing keys at root level
  let lastRootComma = -1;
  let level = 0;
  let sOpen = false;
  let esc = false;
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (char === "\\") {
      esc = true;
      continue;
    }
    if (char === '"') {
      sOpen = !sOpen;
      continue;
    }
    if (!sOpen) {
      if (char === "{" || char === "[") {
        level++;
      } else if (char === "}" || char === "]") {
        level--;
      } else if (char === "," && level === 1) {
        lastRootComma = i;
      }
    }
  }

  if (lastRootComma !== -1) {
    const trailing = result.substring(lastRootComma + 1).trim();
    if (!trailing.includes(":") || trailing.endsWith(":")) {
      result = result.substring(0, lastRootComma).trim();
    }
  }

  // Re-verify final stack to close remaining open brackets
  const finalStack: string[] = [];
  let finalInString = false;
  let finalEscape = false;
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (finalEscape) {
      finalEscape = false;
      continue;
    }
    if (char === "\\") {
      finalEscape = true;
      continue;
    }
    if (char === '"') {
      finalInString = !finalInString;
      continue;
    }
    if (!finalInString) {
      if (char === "{" || char === "[") {
        finalStack.push(char);
      } else if (char === "}" || char === "]") {
        const last = finalStack[finalStack.length - 1];
        if ((char === "}" && last === "{") || (char === "]" && last === "[")) {
          finalStack.pop();
        }
      }
    }
  }

  while (finalStack.length > 0) {
    const last = finalStack.pop();
    if (last === "{") result += "}";
    else if (last === "[") result += "]";
  }

  return result;
}
