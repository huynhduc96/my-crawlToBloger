const { google } = require("googleapis");
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const fs = require("fs");
const Axios = require("axios");

const drive = google.drive("v3");

const forder_id = "1PhnT44VBOEDimZyaFeXddl1dnawZeDbq";

async function runSamples() {
  // Obtain user credentials to use for the request
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credentials.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  google.options({ auth });

  // insertion example

  const fileMetaData = {
    name: "test-image.jpg",
    parents: [forder_id],
  };

  const imageDownload = await Axios({
    url: "http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg",
    method: "GET",
    responseType: "stream",
  });

  const media = {
    mimeType: "image/jpg",
    // body: fs.createReadStream("./test-2.png"),
    body: imageDownload.data,
  };

  const response = await drive.files
    .create({
      resource: fileMetaData,
      media: media,
      field: "id",
    })
    .catch((error) => {
      console.log(error.response.data);
    });
  console.log(response.data.id);
  //https://drive.google.com/uc?export=view&id=
}

runSamples().catch(console.error);
