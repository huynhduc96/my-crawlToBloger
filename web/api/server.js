const express = require("express");
const path = require("path");
const app = express(),
  bodyParser = require("body-parser");
port = 3080;

const fs = require("fs");
var blogId = "";
var openAPIKey = "";
var googleDriveFolderID = "";
var startTime = "";
// ----------------- End import --------------------------

async function writeDataToJson(newTime) {
  startTime = newTime;
  let writeDataTemp = JSON.stringify({
    blogId,
    openAPIKey,
    googleDriveFolderID,
    startTime,
  });
  fs.writeFileSync("data.json", writeDataTemp);
}

async function readDataFromJson() {
  let dataENVRaw = fs.readFileSync("data.json");
  let dataENV = JSON.parse(dataENVRaw);
  blogId = dataENV.blogId;
  openAPIKey = dataENV.openAPIKey;
  googleDriveFolderID = dataENV.googleDriveFolderID;
  startTime = dataENV.startTime;
}

// --------------- not change --------------------------

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../my-app/build")));

// app.get('/api/users', (req, res) => {
//   console.log('api/users called!')
//   res.json(users);
// });

app.get("/api/users", async (req, res) => {
  await readDataFromJson();
  // await writeDataToJson("2023-02-27T21:40:36+09:00");
  res.json(blogId);
});

app.post("/api/user", (req, res) => {
  const user = req.body.user;
  console.log("Adding user:::::", user);
  users.push(user);
  res.json("user addedd");
});

// post to blog

app.post("/api/blogspot", (req, res) => {
  const inputParam = req.body.inputParam;
  console.log("param push input :::::", inputParam);
  res.json("user addedd");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});

//  --------------- not change --------------------------
