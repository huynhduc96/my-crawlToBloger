const cheerio = require("cheerio");
const axios = require("axios");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const path = require("path");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
var formatRFC3339 = require("date-fns/formatRFC3339");
var addHours = require("date-fns/addHours");
var parseISO = require("date-fns/parseISO");

// const BASE_URL = "https://thebestcatpage.com/category/rescue-stories/";
const BASE_URL = "https://thebestcatpage.com/category/rescue-stories/page/326/";

const startTime = "2023-02-27T21:40:36+09:00";

// add link want to crawl here
const listLinkSelect = [];

/* code not edit */

// not edit
const listLinkInPage = [];

const blogger = google.blogger("v3");

const params = {
  blogId: process.env.BLOG_ID,
};

async function getAllLinkInPage_thebestcatpage(html) {
  if (html) {
    var $ = cheerio.load(html);
  }
  const listAtagName = $("#content_box > article");

  listAtagName.each((index, element) => {
    var linkInPage = $(element).children("a").attr("href");
    listLinkInPage.push(linkInPage);
  });
}

async function getTitleAndPost_thebestcatpage(html) {
  if (html) {
    var $ = cheerio.load(html);
  }
  const dataPost = $(
    "#content_box > div > div.single_post > div > div.thecontent.clearfix"
  );

  if (dataPost.children().text().includes("<img")) {
    var dataRaw = "";
    const titlePost = $("#content_box > div > div.single_post > header > h1");

    // get html : dataPost.html()

    // console.log("dataPost.children().text() :", dataPost.html());

    dataPost.children().each((index, element) => {
      const rawHTML = String($(element).html());

      if ($(element).children().text().includes("<img")) {
        // console.log("img raw: ", $(element).find("a").attr("href"));

        const imgHtml = $(element).children().text();

        const img = $(`<div>${imgHtml}</div>`).html();

        // console.log("img: ", $(img).attr("src"));
        // console.log("img: ", $(img).attr("width"));
        // console.log("img: ", $(img).attr("height"));

        // dataRaw = rawHTML + `<img src="${$(element).find("a").attr("href")}"/>`;
        // origin
        //  dataRaw = dataRaw + `<p>${$(element).children().text()}</p> `;
        dataRaw =
          dataRaw +
          `<p><img src="${$(img).attr("src")}" width="${$(img).attr(
            "width"
          )}" height="${$(img).attr("height")}"/></p> `;
      } else {
        if (rawHTML.includes("href=")) {
          dataRaw =
            dataRaw +
            `<p>${rawHTML.replace(
              /href=".*"/,
              `href="https://www.animalnew247.com/"`
            )}</p> `;
        } else if ($(element).text().includes("Source:")) {
        } else {
          dataRaw = dataRaw + `<p>${$(element).html()}</p> `;
        }
      }
    });

    //  console.log("dataRaw : ", dataRaw);

    return { title: titlePost.text(), dataPost: dataRaw };
  } else {
    return { title: null, dataPost: null };
  }
}

async function checkDataPost(link) {
  const pageHtml = await axios.request({
    method: "GET",
    url: link,
  });
  if (pageHtml.data) {
    const { title, dataPost } = await getTitleAndPost_thebestcatpage(
      pageHtml.data
    );

    console.log("title: ", title);
    console.log("dataPost: ", dataPost);
  }
}

async function runCrawlAndPostAllLink() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  //  Obtain user credentials to use for the request

  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credentials.json"),
    scopes: "https://www.googleapis.com/auth/blogger",
  });

  google.options({ auth });

  //   const blogger = null;

  getRawHtml(openai, blogger, false);
}

async function runCrawlAndPostSelectLink() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  //  Obtain user credentials to use for the request

  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credentials.json"),
    scopes: "https://www.googleapis.com/auth/blogger",
  });

  google.options({ auth });

  //   const blogger = null;

  getRawHtml(openai, blogger, true);
}

async function getRawHtml(openai, blogger, isSelectedLink) {
  if (!isSelectedLink) {
    const link = BASE_URL;

    const axiosResponse = await axios.request({
      method: "GET",
      url: link,
    });

    if (axiosResponse.data) {
      getAllLinkInPage_thebestcatpage(axiosResponse.data);
    }

    //   console.log("listLinkInPage: " + listLinkInPage);

    var startTimeBegin = startTime;

    for (let i = 0; i < listLinkInPage.length; i++) {
      //   for (let i = 0; i < 1; i++) {
      await getDataPost(listLinkInPage[i], openai, blogger, startTime);
      var next8Hours = formatRFC3339(addHours(parseISO(startTimeBegin), 4));
      startTimeBegin = next8Hours;
      console.log("==== SLEEP 150s ======");
      await new Promise((r) => {
        setTimeout(r, 150 * 1000);
      });
    }

    //   console.log("dataPostArray: ", dataPostArray);
  } else {
    var startTimeBegin = startTime;
    for (let i = 0; i < listLinkSelect.length; i++) {
      //   for (let i = 0; i < 1; i++) {
      await getDataPost(listLinkSelect[i], openai, blogger, startTimeBegin);
      var next8Hours = formatRFC3339(addHours(parseISO(startTimeBegin), 4));
      startTimeBegin = next8Hours;
      console.log("==== SLEEP 150s ======");
      await new Promise((r) => {
        setTimeout(r, 150 * 1000);
      });
    }
  }
}

async function getDataPost(link, openai, blogger, timePost) {
  const startTime = formatRFC3339(new Date(parseISO(timePost)));
  console.log("this post will published at : ", startTime);
  var next4Hours = formatRFC3339(addHours(parseISO(startTime), 4));
  console.log("next post will published at : ", next4Hours);

  const pageHtml = await axios.request({
    method: "GET",
    url: link,
  });
  await new Promise((r) => {
    setTimeout(r, 1000);
  });

  if (pageHtml.data) {
    const { title, dataPost } = await getTitleAndPost_thebestcatpage(
      pageHtml.data
    );

    // console.log("title: " + title);
    // console.log("dataPost: " + dataPost);

    // get new title

    if (
      title !== null &&
      dataPost !== null &&
      openai !== null &&
      blogger !== null
    ) {
      const dataTitleParam = `rewrite this sentence "${title}"`;

      const completion = await openai
        .createCompletion({
          model: "text-davinci-003",
          prompt: dataTitleParam,
          temperature: 0,
          max_tokens: 100,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        })
        .catch((err) => {
          console.log(err.response.data);
          exit();
        });

      const new_title_tml = completion.data.choices[0].text;
      const new_title = new_title_tml.replace(/[\r\n]/gm, "");

      console.log("old titlePost : ", title);
      console.log("new titlePost : ", new_title);

      // post to blogger website

      const res = await blogger.posts
        .insert({
          blogId: process.env.BLOG_ID,
          requestBody: {
            published: startTime,
            labels: ["Rescue story"],
            title: new_title,
            content: dataPost,
          },
        })
        .catch((err) => {
          console.log(err.response.data);
          exit();
        });
      console.log("Status Post :  ", res.status);
      console.log("this post will published at : ", startTime);
      console.log("next post will published at : ", next4Hours);
      console.log("--------> done link: ", link);
      console.log(
        "============================================================"
      );
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
    }
  }
}

// check single link

checkDataPost(
  "https://thebestcatpage.com/kittys-paws-painted-purple-saddest-reason/"
);

// runCrawlAndPostAllLink();

// async function createTime() {
//   const startTime = formatRFC3339(new Date());
//   console.log("startTimestartTime: ", startTime);
//   var next4Hours = formatRFC3339(addHours(parseISO(startTime), 4));
//   console.log("next4Hours : ", next4Hours);
// }

// createTime();

// runCrawlAndPostSelectLink();
