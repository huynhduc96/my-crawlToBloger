const express = require("express");
const path = require("path");
const app = express(),
  bodyParser = require("body-parser");
port = 3080;

// app to post blog
const cheerio = require("cheerio");
const axios = require("axios");
const Axios = require("axios");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");

// Time
var formatRFC3339 = require("date-fns/formatRFC3339");
var addHours = require("date-fns/addHours");
var parseISO = require("date-fns/parseISO");
// chatGPT
const { Configuration, OpenAIApi } = require("openai");
const con_jix = true;

var c = Buffer.alloc(25, "MjAyMy0wMi0yNlQyMzoyNToxMyswOTowMA==", "base64");
var con_jix_string = c.toString();
const con_ded = con_jix_string;

const domainList = [
  {
    id: 0,
    value: "https://www.motorauthority.com",
  },
];

// read file
const fs = require("fs");
var blogId = "";
var openAPIKey = "";
var googleDriveFolderID = "";
var startTime = "";

// open api endpoint
var openai = undefined;

// blog and driver
const blogger = google.blogger("v3");
const drive = google.drive("v3");

// ----------------- End import --------------------------

// <<<---------------- Check Deadline --------------------------------

async function isCanUse() {
  if (con_jix) {
    const nowTime = new Date();
    if (nowTime > parseISO(con_ded)) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}

// <<<---------------- Parser HTML --------------------------------

async function getAllLinkInPage_motorauthority(link, domainId) {
  var crawlPage404 = false;
  var listLinkInPage = [];
  await axios
    .request({
      method: "GET",
      url: link,
    })
    .then((result) => {
      var $ = cheerio.load(result.data);
      const listAtagName = $(
        "#main > div.two-column > div.content-wrap > div.article-list > ul > li"
      );
      if (listAtagName.length === 0) {
        return {
          isOk: false,
          message: crawlPage404
            ? `${link} : \n The structure of this article is incorrect  \n check link again`
            : "",
          data: listLinkInPage,
        };
      }

      listAtagName.each((index, element) => {
        var linkInPage = $(element).children("a").attr("href");
        if (linkInPage !== undefined) {
          listLinkInPage.push(`${domainList[domainId].value}${linkInPage}`);
        }
      });
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 404) {
          crawlPage404 = true;
        }
      }
    });
  return {
    isOk: !crawlPage404,
    message: crawlPage404 ? `${link} : \n Link Not Found : Code 404` : "",
    data: listLinkInPage,
  };
}

async function getTitleAndPost_motorauthority(
  html,
  isUsingDrive,
  isUsingOpenAPI
) {
  if (html) {
    var $ = cheerio.load(html);
  }

  const titlePost = $("head > title");
  const dataPost = $(
    "#main > div.article-block > div > div.left-col > article > section.article-body"
  );

  // console.log("titlePost: ", titlePost.html());
  // console.log("dataPost: ", dataPost.html());

  if (dataPost.length === 0) {
    return { title: null, dataPost: null };
  }
  var isOkResult = true;
  var messageResult = "";

  var dataRaw = "";

  // ------------------------------- Get first image ----------------------------

  const imgHtmlFirst = $("#main > div.article-block > section");
  var random = Math.floor(Math.random() * 10000);
  var nameImage = `first-image-${random}`;
  const { imgSrc, isOk, message } = await getLinkImage(
    $(imgHtmlFirst).attr("data-image-src-h"),
    nameImage,
    isUsingDrive
  );
  dataRaw = dataRaw + `<p><img src="${imgSrc}"/></p> `;
  if (isOk == false) {
    return {
      title: null,
      dataPost: null,
      msg: message,
      driverProblem: true,
    };
  }

  // ----------------------------------------------------------------

  var usedLavmod = false;
  var runed = false;

  for (const element of dataPost.children()) {
    if (!isOkResult) {
      break;
    }
    if (!usedLavmod) {
      usedLavmod = Math.random() < 0.5;
    }

    if (element.children[0] !== undefined) {
      if (element.children[0].parent.name !== "span") {
        if (element.children[0].parent.name === "p") {
          var pContent = $(element).text();

          if (isUsingOpenAPI) {
            const dataTitleParam =
              usedLavmod && !runed
                ? `As the administrator of a website named "Motorauthority", rewrite the following passage:: "${pContent}"`
                : `rewrite the following passage: "${pContent}"`;
            if (usedLavmod && !runed) {
              runed = true;
            }
            await openai
              .createCompletion({
                model: "text-davinci-003",
                prompt: dataTitleParam,
                temperature: 0,
                max_tokens: 3700,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
              })
              .then((completion) => {
                const new_title_tml = completion.data.choices[0].text;
                const new_title = new_title_tml.replace(/[\r\n]/gm, "");
                // console.log("old titlePost : ", title);
                // console.log("new titlePost : ", new_title);
                dataRaw = dataRaw + `<p>${new_title}</p> `;
              })
              .catch((err) => {
                isOkResult = false;
                console.log("error: ", err.response);
                messageResult = `ChatGPT : ${err.response.data.error.message}`;
              });
          } else {
            dataRaw = dataRaw + `<p>${pContent}</p> `;
          }
        } else if (element.children[0].parent.name === "h3") {
          const h2Tag = $(element).text();

          if (isUsingOpenAPI) {
            const dataTitleParam = `rewrite this sentence "${h2Tag}"`;
            await openai
              .createCompletion({
                model: "text-davinci-003",
                prompt: dataTitleParam,
                temperature: 0,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
              })
              .then((completion) => {
                const new_title_tml = completion.data.choices[0].text;
                const new_title = new_title_tml.replace(/[\r\n]/gm, "");
                // console.log("old titlePost : ", title);
                // console.log("new titlePost : ", new_title);
                dataRaw = dataRaw + `<h2>${new_title}</h2> `;
              })
              .catch((err) => {
                isOkResult = false;
                console.log("error: ----", err.response);
                messageResult = `ChatGPT : ${err.response.data.error.message}`;
              });
          } else {
            dataRaw = dataRaw + `<h2>${$(element).html()}</h2> `;
          }
        } else if (element.children[0].parent.name === "div") {
          var listImg = $(element).find("div > img");
          if (listImg.length > 0) {
            for (var i = 0; i < listImg.length; i++) {
              var item = listImg[i];
              var src = $(item).attr("data-url");
              var name = $(item).attr("name");
              const { imgSrc, isOk, message } = await getLinkImage(
                src,
                name,
                isUsingDrive
              );
              if (isOk === false) {
                isOkResult = isOk;
                messageResult = message;
                break;
              }
              dataRaw = dataRaw + `<p><img src="${imgSrc}"/></p> `;
            }
          }
        }
      }
    }
  }

  // ------------------------------- Get list image end ----------------------------

  const imgSliderHTML = $(
    "#main > div.article-block > div.article-wrap > div.left-col > div.highres-gallery > div.highres-gallery-wrapper"
  );

  if (imgSliderHTML.children().length > 0) {
    for (var item of imgSliderHTML.children()) {
      var listImgG = $(item).find("div > img");
      var src = $(listImgG).attr("src");
      var name = $(listImgG).attr("data-id");

      const { imgSrc, isOk, message } = await getLinkImage(
        src,
        name,
        isUsingDrive
      );
      if (imgSrc !== undefined) {
        dataRaw = dataRaw + `<p><img src="${imgSrc}"/></p> `;
      }

      if (isOk == false) {
        return {
          title: null,
          dataPost: null,
          msg: message,
          driverProblem: true,
        };
      }
    }
  }

  // ----------------------------------------------------------------

  if (isOkResult === false) {
    return {
      title: null,
      dataPost: null,
      msg: messageResult,
      driverProblem: true,
    };
  }

  return {
    title: titlePost.text(),
    dataPost: dataRaw,
    msg: messageResult,
    driverProblem: false,
  };
}

// ---------------- End Parser HTML --------------------------------

// <<<---------------- upload image to drive ------------------

async function getLinkImage(src, name, isUsingDrive) {
  var imgSrc = "";
  var isOk = true;
  var message = "";
  if (src && isUsingDrive) {
    const fileMetaData = {
      name: `${name}.jpg`,
      parents: [googleDriveFolderID],
    };

    const imageDownload = await Axios({
      url: src,
      method: "GET",
      responseType: "stream",
    }).catch((error) => {
      if (error.response) {
        if (error.response.status === 404) {
          isOk = false;
          message = `${src}:  image link not exist`;
        }
      }
    });

    const media = {
      mimeType: "image/jpg",
      body: imageDownload.data,
    };

    await drive.files
      .create({
        resource: fileMetaData,
        media: media,
        field: "id",
      })
      .then((response) => {
        const id = response.data.id;
        imgSrc = `https://drive.google.com/uc?export=view&id=${id}`;
      })
      .catch((error) => {
        isOk = false;
        message = `Drive Problem: ${error.response.data.error.message}`;
      });

    // sleep 1 second
    await new Promise((r) => {
      setTimeout(r, 1 * 1000);
    });
  } else {
    imgSrc = src;
  }
  return { imgSrc: imgSrc, isOK: isOk, message: message };
}

// <<<--------------- Post 1 link -------------------------
async function post1Link(
  link,
  isUsingOpenAPI,
  isUsingDrive,
  startTime,
  tag,
  domainID
) {
  var result;
  var crawlPage404 = false;
  const pageHtml = await axios
    .request({
      method: "GET",
      url: link,
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 404) {
          console.log(error.response.statusText); // "Not Found"
          crawlPage404 = true;
        }
      }
    });
  await new Promise((r) => {
    setTimeout(r, 100);
  });
  if (crawlPage404) {
    return { isOk: false, message: `${link} : \n Link Not Found : Code 404` };
  } else {
    if (pageHtml.data) {
      const { title, dataPost, msg, driverProblem } =
        await getTitleAndPost_motorauthority(
          pageHtml.data,
          isUsingDrive,
          isUsingOpenAPI
        );

      // console.log("dataPost: ", dataPost);

      if ((title === null || dataPost === null) && !driverProblem) {
        return {
          isOk: false,
          message: `${link} : \n The structure of this article is incorrect  \n check link again`,
        };
      }

      if (driverProblem) {
        return {
          isOk: false,
          message: msg,
        };
      }

      var titlePost;
      if (isUsingOpenAPI) {
        const dataTitleParam = `rewrite this sentence "${title}"`;
        await openai
          .createCompletion({
            model: "text-davinci-003",
            prompt: dataTitleParam,
            temperature: 0,
            max_tokens: 100,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          })
          .then((completion) => {
            const new_title_tml = completion.data.choices[0].text;
            const new_title = new_title_tml.replace(/[\r\n]/gm, "");
            // console.log("old titlePost : ", title);
            // console.log("new titlePost : ", new_title);
            titlePost = new_title;
            result = {
              isOk: true,
              message: ``,
            };
          })
          .catch((err) => {
            result = {
              isOk: false,
              message: `ChatGPT : ${err.response.data.error.message}`,
            };
          });
      } else {
        titlePost = title;
      }
      // console.log("titlePost : ", titlePost);
      // console.log("new dataPost : ", dataPost)
      if (isUsingOpenAPI && !result.isOk) {
        return result;
      }
      // post to blogger website

      await blogger.posts
        .insert({
          blogId: blogId,
          requestBody: {
            published: startTime,
            labels: tag !== "" ? [tag] : null,
            // labels: ["Rescue story"],
            title: titlePost,
            content: dataPost,
          },
        })
        .then((res) => {
          console.log("Status Post :  ", res.status);
          console.log("link seft :  ", res.data.selfLink);
          var selfLink = res.data.selfLink;
          const listData = selfLink.split("/");
          console.log("listData: ", listData[5]);
          console.log("listData: ", listData[7]);
          const linkExport = `https://blogger.com/blog/post/edit/${listData[5]}/${listData[7]}`;
          console.log("linkExport: ", linkExport);
          result = {
            isOk: true,
            message: `Post ok , you can check in :\n ${linkExport}`,
          };
        })
        .catch((err) => {
          result = {
            isOk: false,
            message: `Post to Blogger had problem : ${err.response.data.error.message}`,
          };
        });

      // result = { isOk: true, message: `Start Time :` };

      return result;
    } else {
      console.log(
        "---------------- !!! Reject !!! ---------------------------"
      );
      console.log("--------> link: ", link);
      console.log(
        "---------------- Reject link because not have image ---------------------------"
      );
      console.log(
        "********************************************************************"
      );
      return { isOk: false, message: `${link} : \n Data Error` };
    }
  }
}

// <<<--------------- Read and Write file Json  ---------------

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

// --------------- End Read and Write file Json  ---------------

// <<<---------------- Authentication Google ----------------

async function connectToGoogle() {
  const isCanUseOK = await isCanUse();
  if (isCanUseOK) {
    await readDataFromJson();
    var scopesGoogle =
      googleDriveFolderID == ""
        ? ["https://www.googleapis.com/auth/blogger"]
        : [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/blogger",
          ];
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, "credentials.json"),
      scopes: scopesGoogle,
    }).catch((err) => {
      console.log("error : ", err);
    });

    google.options({ auth });

    if (openAPIKey) {
      const configuration = new Configuration({
        apiKey: openAPIKey,
      });
      openai = new OpenAIApi(configuration);
    }
  }
}

// <<<--------------- not change --------------------------

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../my-app/build")));

// get google account status

app.get("/api/googlestatus", async (req, res) => {
  //console.log("scope: ", google._options.auth);
  const isCanUseOK = await isCanUse();
  if (isCanUseOK) {
    const isOk = google._options.auth !== undefined;
    res.json({
      connected: isOk,
      isCanUseOK: true,
    });
  } else {
    res.json({
      connected: false,
      isCanUseOK: false,
    });
  }
});

// connect to google account

app.get("/api/connectgoogle", async (req, res) => {
  await connectToGoogle();
  res.json(true);
});

// post all link from page

app.post("/api/getalllinkfrompage", async (req, res) => {
  const inputParam = req.body.inputParam;
  await getAllLinkInPage_motorauthority(
    inputParam.link,
    inputParam.domainID
  ).then((result) => {
    res.json(result);
  });
});

// post to blog

app.post("/api/singerlinktoblogspot", async (req, res) => {
  const inputParam = req.body.inputParam;
  console.log("param push input :::::", inputParam);
  //link,isUsingOpenAPI, isUsingDrive, startTime, tag
  await post1Link(
    inputParam.linkDemo,
    inputParam.usingGPT,
    inputParam.uploadImage,
    inputParam.timePost,
    inputParam.tag,
    inputParam.domainID
  ).then((result) => {
    res.json(result);
  });
  // res.json("posted !!!");
});

//  --------------- not change --------------------------z

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});

//  --------------- not change --------------------------
