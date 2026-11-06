const chunks = [];

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(chunks.join(''));
  } catch {
    deny('No se pudo validar la ruta del archivo; se bloqueó la operación por seguridad.');
    return;
  }

  const paths = [];
  const collectPatchPaths = value => {
    if (typeof value !== 'string') return;
    const matcher = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;
    let match;
    while ((match = matcher.exec(value)) !== null) paths.push(match[1].trim());
    const moveMatcher = /^\*\*\* Move to: (.+)$/gm;
    while ((match = moveMatcher.exec(value)) !== null) paths.push(match[1].trim());
  };

  const collectPaths = (value, key = '') => {
    if (typeof value === 'string') {
      if (/(?:file.?path|filename|^path$|^file$)/i.test(key)) paths.push(value);
      collectPatchPaths(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => collectPaths(item, key));
      return;
    }

    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([childKey, childValue]) => collectPaths(childValue, childKey));
    }
  };

  collectPaths(event.tool_input ?? event.toolInput);

  if (paths.length === 0) {
    deny('No se encontró la ruta del archivo; se bloqueó la operación por seguridad.');
    return;
  }

  const editsEnv = paths.some(filePath => {
    const segments = filePath.replace(/\\/g, '/').split('/').filter(Boolean);
    return segments.at(-1)?.toLowerCase() === '.env';
  });

  if (editsEnv) {
    deny('La edición de archivos .env está prohibida. Usa .env.example sin credenciales reales.');
  } else {
    process.stdout.write('{}\n');
  }
});

function deny(reason) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  })}\n`);
}
