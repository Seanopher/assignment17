const express = require("express");
const app = express();
const multer = require("multer");
const Joi = require("joi");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect("mongodb://localhost/albums")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

const albumSchema = new mongoose.Schema({
  name: String,
  artist: String, 
  img: String,
  _id: mongoose.SchemaTypes.ObjectId,
});

const album = mongoose.model("album", albumSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/albums", (req, res) => {
  getalbums(res);
});

const getalbums = async (res) => {
  const albums = await album.find();
  res.send(albums);
};

app.get("/api/albums/:id", (req, res) => {
  getalbum(req.params.id, res);
});

const getalbum = async (id, res) => {
  const album = await album.findOne({ _id: id });
  res.send(album);
};

app.post("/api/albums", upload.single("img"), (req, res) => {
  const result = validatealbum(req.body);
  console.log(result);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const album = new album({
    name: req.body.name,
    artist: req.body.artist,
  });

  if (req.file) {
    album.img = "images/" + req.file.filename;
  }

  createalbum(album, res);
});

const createalbum = async (album, res) => {
  const result = await album.save();
  res.send(album);
};

app.put("/api/albums/:id", upload.single("img"), (req, res) => {
  const result = validatealbum(req.body);
  console.log(result);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }
  updatealbum(req, res);
});

const updatealbum = async (req, res) => {
  let fieldsToUpdate = {
    name: req.body.name,
    artist: req.body.artist,
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const result = await album.updateOne({ _id: req.params.id }, fieldsToUpdate);

  res.send(result);
};

app.delete("/api/albums/:id", (req, res) => {
  removealbum(res, req.params.id);
});

const removealbum = async (res, id) => {
  const album = await album.findByIdAndDelete(id);
  res.send(album);
};

function validatealbum(album) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    artist: Joi.string().min(3).required(),
    _id: Joi.allow(""),
  });

  return schema.validate(album);
}

app.listen(3000, () => {
  console.log("I'm listening");
});