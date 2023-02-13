const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const path = require("path");
require("dotenv").config();

const blogger = google.blogger("v3");


const params = {
  blogId: process.env.BLOG_ID,
};

async function runSample() {
  const res = await blogger.blogs.get(params);
  console.log(`The blog url is ${res.data.url}`);
}

async function post() {
  // Obtain user credentials to use for the request
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credentials.json"),
    scopes: "https://www.googleapis.com/auth/blogger",
  });

  google.options({ auth });

  const res = await blogger.posts.insert({
    blogId: process.env.BLOG_ID,
    requestBody: {
      //   published: "2023-02-10T14:55:02+09:00",
      // labels: ["Cats"],
      title: "test catalogy",
      content: `ahhi`,
    },
  });
  console.log(res.data);
  return res.data;
}

post().catch(console.error);
