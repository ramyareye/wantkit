import { test, expect } from "bun:test";
import { createHash } from "node:crypto";
import { copyPreviewMedia, snapshotBucket } from "./cloudflare-rename-r2.mjs";

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
function bucket(initial = []) {
  const objects = new Map(initial.map((object) => [object.key, object]));
  return {
    objects,
    puts: 0,
    pages: 0,
    beforePut: null,
    afterPut: null,
    async list({ cursor, include }) {
      expect(include).toEqual(["httpMetadata", "customMetadata"]);
      this.pages++;
      const keys = [...objects.keys()].sort();
      const offset = Number(cursor ?? 0);
      // Deliberately short pages: length must not be used as an end condition.
      const selected = keys.slice(offset, offset + 1);
      const truncated = offset + 1 < keys.length;
      return {
        objects: selected.map((key) => objects.get(key)),
        truncated,
        cursor: truncated ? String(offset + 1) : undefined,
      };
    },
    async get(key) {
      const object = objects.get(key);
      if (!object) return null;
      return { ...object, arrayBuffer: async () => Buffer.from(object.bytes) };
    },
    async put(key, bytes, options) {
      this.puts++;
      expect(options.onlyIf).toEqual({ etagDoesNotMatch: "*" });
      expect(options.sha256).toBe(digest(bytes));
      this.beforePut?.(key);
      if (objects.has(key)) return null;
      const object = item(key, bytes, options);
      objects.set(key, object);
      this.afterPut?.(key);
      return object;
    },
  };
}
function item(key, bytes = "image-data", options = {}) {
  return {
    key,
    bytes: Buffer.from(bytes),
    size: Buffer.byteLength(bytes),
    etag: digest(bytes),
    version: crypto.randomUUID(),
    httpMetadata: options.httpMetadata ?? {
      contentType: "image/webp",
      cacheControl: "private, no-store",
      cacheExpiry: new Date("2027-01-01"),
    },
    customMetadata: options.customMetadata ?? {
      imageId: "image-1",
      visualRunId: "run-1",
    },
    storageClass: options.storageClass ?? "Standard",
  };
}
async function fixture() {
  const source = bucket([
    item("folder/one.webp"),
    item("folder/two.webp", "second-image"),
  ]);
  const target = bucket();
  return {
    source,
    target,
    sourceName: "kharidyar-concept-media-preview",
    targetName: "hopkit-concept-media-preview",
    expectedManifest: await snapshotBucket(source),
  };
}

test("copies every page and preserves exact metadata casing, dates and bytes; retry skips identical objects", async () => {
  const args = await fixture();
  expect((await copyPreviewMedia(args)).copied).toBe(2);
  for (const [key, object] of args.source.objects) {
    expect(args.target.objects.get(key).bytes).toEqual(object.bytes);
    expect(args.target.objects.get(key).customMetadata).toEqual(
      object.customMetadata,
    );
    expect(args.target.objects.get(key).httpMetadata).toEqual(
      object.httpMetadata,
    );
  }
  expect((await copyPreviewMedia(args)).skipped).toBe(2);
  expect(args.target.puts).toBe(2);
});

test("rejects a production pair and an absent manifest before writes", async () => {
  const args = await fixture();
  await expect(
    copyPreviewMedia({
      ...args,
      targetName: "hopkit-concept-media-production",
    }),
  ).rejects.toThrow("preview bucket pair");
  await expect(
    copyPreviewMedia({ ...args, expectedManifest: undefined }),
  ).rejects.toThrow("manifest");
  expect(args.target.puts).toBe(0);
});

test("a changed source fails before copying", async () => {
  const args = await fixture();
  args.source.objects.set(
    "folder/one.webp",
    item("folder/one.webp", "new-data"),
  );
  await expect(copyPreviewMedia(args)).rejects.toThrow("approved snapshot");
  expect(args.target.puts).toBe(0);
});

test("conflicting metadata and unexpected target keys fail before any writes", async () => {
  for (const object of [
    item("folder/one.webp", "image-data", {
      customMetadata: { imageid: "image-1" },
    }),
    item("unexpected.webp"),
  ]) {
    const args = await fixture();
    args.target.objects.set(object.key, object);
    await expect(copyPreviewMedia(args)).rejects.toThrow(
      "conflicting or unexpected",
    );
    expect(args.target.puts).toBe(0);
  }
});

test("a racing destination write is never overwritten", async () => {
  const args = await fixture();
  args.target.beforePut = (key) =>
    args.target.objects.set(key, item(key, "racing-data"));
  await expect(copyPreviewMedia(args)).rejects.toThrow("create-only");
  expect(args.target.objects.get("folder/one.webp").bytes.toString()).toBe(
    "racing-data",
  );
});

test("source writes during copy invalidate cutover and keep the copy for review", async () => {
  const args = await fixture();
  args.target.afterPut = () =>
    args.source.objects.set("new.webp", item("new.webp"));
  await expect(copyPreviewMedia(args)).rejects.toThrow(
    "Source changed during copy",
  );
  expect(args.target.objects.size).toBe(2);
});

test("read-back detects corrupt destination bytes even at the same size", async () => {
  const args = await fixture();
  args.target.afterPut = (key) => args.target.objects.get(key).bytes.fill(0);
  await expect(copyPreviewMedia(args)).rejects.toThrow(
    "Destination verification failed",
  );
});

test("a repeated pagination cursor and an oversized object fail closed", async () => {
  const stuck = {
    list: async () => ({ objects: [], truncated: true, cursor: "same" }),
  };
  await expect(snapshotBucket(stuck)).rejects.toThrow("cursor");
  const large = bucket([{ ...item("large.webp"), size: 10 * 1024 * 1024 + 1 }]);
  await expect(snapshotBucket(large)).rejects.toThrow("bounds");
});
