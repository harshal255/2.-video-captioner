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
  let inString = false;
  let escape = false;
  let expectingValue = false;
  const stack: string[] = [];
  let lastCommaIndex = -1;

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
        stack.pop();
      } else if (char === ",") {
        expectingValue = false;
        lastCommaIndex = i;
      } else if (char === ":") {
        expectingValue = true;
      }
    }
  }

  // Case A: Truncated inside a double-quoted string value
  if (inString && expectingValue) {
    result += '"';
    
    // Close remaining open brackets in reverse order
    while (stack.length > 0) {
      const last = stack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
    return result;
  }

  // Case B: Truncated outside string or inside a half-written key string
  if (lastCommaIndex !== -1) {
    // Slice off the incomplete segment after the last comma
    result = result.substring(0, lastCommaIndex).trim();
    
    // Re-verify the bracket stack up to the comma to be accurate
    const freshStack: string[] = [];
    let freshInString = false;
    let freshEscape = false;
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      if (freshEscape) {
        freshEscape = false;
        continue;
      }
      if (char === "\\") {
        freshEscape = true;
        continue;
      }
      if (char === '"') {
        freshInString = !freshInString;
        continue;
      }
      if (!freshInString) {
        if (char === "{" || char === "[") {
          freshStack.push(char);
        } else if (char === "}" || char === "]") {
          freshStack.pop();
        }
      }
    }
    
    // Close the recalculated open brackets
    while (freshStack.length > 0) {
      const last = freshStack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
  } else {
    // Fallback: No comma found, just close original stack
    while (stack.length > 0) {
      const last = stack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
  }

  return result;
}
