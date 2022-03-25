const multer = require("multer");
const newNanoId = require("nanoid"); // package npm qui permet de générer des id

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    const id = newNanoId.nanoid();
    callback(null, "image_" + id + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
