// const http = require("http"); // or 'https' for https:// URLs
// const fs = require("fs");

// const file = fs.createWriteStream("file.jpg");
// const request = http.get(
//   "http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg",
//   function (response) {
//     response.pipe(file);

//     // after download completed close filestream
//     file.on("finish", () => {
//       file.close();
//       console.log("Download Completed");
//     });
//   }
// );

const fs = require("fs");
const Axios = require("axios");

async function downloadImage(url) {
  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  console.log("data: ", response.data);
}

downloadImage("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
