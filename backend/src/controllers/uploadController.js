const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const allowed = { "image/jpeg":".jpg", "image/png":".png", "image/webp":".webp", "image/gif":".gif", "video/mp4":".mp4", "video/webm":".webm", "audio/mpeg":".mp3", "audio/mp4":".m4a", "audio/ogg":".ogg", "audio/wav":".wav" };

const upload = async (req, res) => {
  try {
    const mime = String(req.query.mime || "").toLowerCase();
    const extension = allowed[mime];
    if (!extension) return res.status(400).json({ message: "Unsupported file type" });
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ message: "File is required" });
    const directory = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.join(__dirname, "../../uploads");
    await fs.mkdir(directory, { recursive: true });
    const filename = `${req.user.id}-${crypto.randomUUID()}${extension}`;
    await fs.writeFile(path.join(directory, filename), req.body);
    const origin = `${req.protocol}://${req.get("host")}`;
    return res.status(201).json({ url: `${origin}/uploads/${filename}`, mime });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Unable to upload file" }); }
};
module.exports = { upload };
