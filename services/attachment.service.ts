import { db } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const attachmentService = {
  /** List attachments for a card */
  async list(cardId: string) {
    const attachments = await db.cardAttachment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
    });
    return attachments.map((a) => ({
      id: a.id,
      name: a.name,
      url: `/uploads/${a.s3Key}`,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      createdAt: a.createdAt.toISOString(),
    }));
  },

  /** Save an uploaded file and create attachment record */
  async create(cardId: string, file: File) {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name);
    const key = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, key);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const attachment = await db.cardAttachment.create({
      data: {
        cardId,
        name: file.name,
        s3Key: key,
        mimeType: file.type || null,
        sizeBytes: buffer.length,
      },
    });

    return {
      id: attachment.id,
      name: attachment.name,
      url: `/uploads/${key}`,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      createdAt: attachment.createdAt.toISOString(),
    };
  },

  /** Delete an attachment and its file */
  async delete(id: string) {
    const attachment = await db.cardAttachment.findUnique({ where: { id } });
    if (attachment) {
      try {
        await unlink(path.join(UPLOAD_DIR, attachment.s3Key));
      } catch {
        // File may not exist, that's fine
      }
      await db.cardAttachment.delete({ where: { id } });
    }
  },
};
