import { createHash } from "node:crypto";

// Preparation library only: no credentials, remote sessions, CLI, or automatic run.
// Call only during an approved preview migration, with all writers frozen.
// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
const limits = {
  objects: 100,
  objectBytes: 10 * 1024 * 1024,
  totalBytes: 32 * 1024 * 1024,
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const canonical = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  }
  return value;
};
const equal = (a, b) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const metadata = (object) => ({
  key: object.key,
  size: object.size,
  httpMetadata: object.httpMetadata ?? {},
  customMetadata: object.customMetadata ?? {},
  storageClass: object.storageClass,
});
const revision = (object) => ({
  ...metadata(object),
  etag: object.etag,
  version: object.version,
});
const content = ({ etag, version, ...record }) => record;

async function capture(bucket) {
  const listed = new Map();
  const cursors = new Set();
  let cursor;
  let totalBytes = 0;
  do {
    const page = await bucket.list({
      include: ["httpMetadata", "customMetadata"],
      cursor,
    });
    for (const object of page.objects) {
      if (listed.has(object.key))
        throw new Error("Duplicate object in listing");
      if (
        !Number.isSafeInteger(object.size) ||
        object.size < 0 ||
        object.size > limits.objectBytes
      ) {
        throw new Error("Object exceeds reviewed preview copy bounds");
      }
      totalBytes += object.size;
      listed.set(object.key, object);
      if (listed.size > limits.objects || totalBytes > limits.totalBytes) {
        throw new Error("Bucket exceeds reviewed preview copy bounds");
      }
    }
    if (!page.truncated) break;
    if (!page.cursor || cursors.has(page.cursor))
      throw new Error("Invalid listing cursor");
    cursors.add(page.cursor);
    cursor = page.cursor;
  } while (true);

  const records = [];
  const bodies = new Map();
  for (const key of [...listed.keys()].sort()) {
    const object = await bucket.get(key);
    if (!object || !equal(revision(object), revision(listed.get(key)))) {
      throw new Error("Object changed during snapshot");
    }
    if (object.ssecKeyMd5)
      throw new Error("Encrypted object requires a separate copy plan");
    const bytes = Buffer.from(await object.arrayBuffer());
    if (bytes.length !== object.size)
      throw new Error("Object body size mismatch");
    records.push({ ...revision(object), sha256: hash(bytes) });
    bodies.set(key, bytes);
  }
  return { records, bodies };
}

// Treat this manifest as private evidence. Save under the ignored .tmp folder.
export async function snapshotBucket(bucket) {
  return (await capture(bucket)).records;
}

export async function copyPreviewMedia({
  source,
  target,
  sourceName,
  targetName,
  expectedManifest,
}) {
  if (
    sourceName !== "kharidyar-concept-media-preview" ||
    targetName !== "hopkit-concept-media-preview" ||
    source === target
  ) {
    throw new Error("Only the reviewed preview bucket pair is supported");
  }
  if (!Array.isArray(expectedManifest) || expectedManifest.length === 0) {
    throw new Error("A nonempty fresh source manifest is required");
  }
  // Caller must verify these names against the actual remote binding configuration.
  const before = await capture(source);
  if (!equal(before.records, expectedManifest))
    throw new Error("Source differs from approved snapshot");
  const existing = await snapshotBucket(target);
  const wanted = new Map(before.records.map((record) => [record.key, record]));
  for (const record of existing) {
    if (
      !wanted.has(record.key) ||
      !equal(content(record), content(wanted.get(record.key)))
    ) {
      throw new Error("Destination contains conflicting or unexpected objects");
    }
  }
  const present = new Set(existing.map((record) => record.key));
  let copied = 0;
  for (const record of before.records) {
    if (present.has(record.key)) continue;
    const result = await target.put(record.key, before.bodies.get(record.key), {
      httpMetadata: record.httpMetadata,
      customMetadata: record.customMetadata,
      storageClass: record.storageClass,
      sha256: record.sha256,
      onlyIf: { etagDoesNotMatch: "*" },
    });
    if (!result)
      throw new Error("Destination changed before create-only write");
    copied++;
  }
  if (!equal(await snapshotBucket(source), before.records)) {
    throw new Error("Source changed during copy; do not cut over");
  }
  const after = await snapshotBucket(target);
  if (!equal(after.map(content), before.records.map(content))) {
    throw new Error("Destination verification failed; do not cut over");
  }
  // No deletion or rollback: retain partial copies for review on any failure.
  return { copied, skipped: present.size, manifest: after };
}
