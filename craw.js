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

const startTime = "2023-02-15T21:40:36+09:00";

// add link want to crawl here
const listLinkSelect = [
  "https://thebestcatpage.com/hazel-rescues-tiny-abandoned-kitten-and-brings-her-home-during-rain-storm/",
  "https://thebestcatpage.com/frostbitten-cat-first-world-receive-4-prosthetic-limbs/",
  "https://thebestcatpage.com/this-runt-of-the-litter-kitten-gets-its-head-stuck-in-a-wooden-fence-and-calls-for-help/",
  "https://thebestcatpage.com/kitten-toothbrush-is-found-with-umbilical-cord-still-attached/",
  "https://thebestcatpage.com/kittens-rubbish-dump-and-left-fatima/",
  "https://thebestcatpage.com/bowlegged-kitten-abandoned/",
  "https://thebestcatpage.com/a-two-faced-kitten-beats-all-odds-to-survive/",
  "https://thebestcatpage.com/cat-who-walked-12-miles-back-to-family-who-then-tried-to-euthanize-him-finds-new-home/",
  "https://thebestcatpage.com/stray-cat-with-saddest-eyes-founds-in-dumpster/",
  "https://thebestcatpage.com/someone-threw-this-kitten-in-the-trash-to-die/",
  "https://thebestcatpage.com/mom-sees-her-missing-cat-on-a-local-shelters-facebook-page-after-3-long-years/",
  "https://thebestcatpage.com/woman-finds-stray-cat-whos-missing-back-legs/",
  "https://thebestcatpage.com/man-finds-a-tiny-kitten-in-a-forest-but-its-not-what-it-seems/",
  "https://thebestcatpage.com/this-cat-was-in-a-poor-condition-because-of-his-fur-but-underneath-it-an-angel-was-hiding/",
  "https://thebestcatpage.com/woman-sees-strange-creature-crawling-up-driveway-and-her-heart-sinks-when-she-gets-closer-look/",
  "https://thebestcatpage.com/neglected-cat-with-dreadlocks-loses-2-pounds-of-master-fur/",
  "https://thebestcatpage.com/a-vet-finds-a-sick-and-abandoned-kitty-in-a-bush-and-gives-it-another-shot-at-life/",
  "https://thebestcatpage.com/the-vet-wanted-to-euthanize-this-cat-but-his-amazing-recovery-shocked-everyone/",
  "https://thebestcatpage.com/sick-cat-spends-most-of-his-life-trapped-in-carrier/",
  "https://thebestcatpage.com/stray-cat-with-unique-face-begs-her-rescuer-to-keep-her-and-she-wins/",
  "https://thebestcatpage.com/destiny-playes-rough-with-this-tiny-kitten-but-take-a-look-at-him-now/",
  "https://thebestcatpage.com/curious-dog-drags-owner-towards-mysterious-cardboard-box-with-something-in-it/",
  "https://thebestcatpage.com/a-boy-with-unique-lips-and-eyes-finds-his-matching-best-friend/",
  "https://thebestcatpage.com/these-kitten-brothers-refused-to-stop-cuddling-and-made-a-girl-adopt-them-both/",
  "https://thebestcatpage.com/abandoned-and-covered-in-ants-this-kitten-needed-a-miracle-to-survive/",
  "https://thebestcatpage.com/kitten-with-adorable-butterfly-shaped-nose-grows-into-majestic-fluffy-cat/",
  "https://thebestcatpage.com/10-pictures-showing-stunning-recovery-of-rescued-cats/",
  "https://thebestcatpage.com/woman-adopts-sick-cat-from-shelter-returns-one-week-later-to-get-best-friend-too/",
  "https://thebestcatpage.com/this-adorable-kitty-has-a-nice-wink-and-a-heartwarming-story-to-tell/",
  "https://thebestcatpage.com/this-handicapped-kitten-has-had-a-rough-life-but-hes-a-fighter/",
  "https://thebestcatpage.com/serial-cat-thief-caught-with-15-stolen-pets-during-police-raid/",
  "https://thebestcatpage.com/disabled-kitten-who-was-almost-put-down-is-now-the-best/",
  "https://thebestcatpage.com/neglected-persian-cat/",
  "https://thebestcatpage.com/cat-who-has-chromosomal-abnormality-has-luckily-found-the-perfect/",
  "https://thebestcatpage.com/cat-with-a-swollen-mouth-literally-walked-up-to-people-in-a-restaurant-begging-for/",
  "https://thebestcatpage.com/amazing-and-adorable-pictures-of-a-husky-who-identified-as-a-cat/",
  "https://thebestcatpage.com/this-might-very-well-be-the-worlds-angriest-cat-the-reason-shes-angry-will-break-your-heart/",
  "https://thebestcatpage.com/poor-kitten-left-with-his-eyes-bulging-from-their-sockets-after-serious/",
  "https://thebestcatpage.com/10-adorable-cats-who-have-googly-eyes-but-are-gorgeous-nonetheless/",
  "https://thebestcatpage.com/miracle-cat-born-with-just-two-legs-and-no-pelvis-doesnt-let-anything-stop-him-from/",
  "https://thebestcatpage.com/blind-cat-literally-saves-brothers-life-in-what-owner-describes-as-a-very-unique/",
  "https://thebestcatpage.com/dog-lost-her-best-feline-friend-but-then-kittens-come-to-her-rescue/",
  "https://thebestcatpage.com/beautiful-photos-of-a-rescued-cat-with-a-broken-jaw-meeting-his-forever-family-will-completely-warm-your-heart/",
  "https://thebestcatpage.com/policeman-rescues-dying-kitten-from-sewer-and-then-does-something-amazing/",
  "https://thebestcatpage.com/angry-stray-kitten-discovered-wounded-gets-his-world-flipped-around-by/",
  "https://thebestcatpage.com/15-rescue-cats-proving-adopting-better-shopping/",
  "https://thebestcatpage.com/severely-burned-kitten-rescued-fire-neighbor-sees-paws-poking-shed/",
  "https://thebestcatpage.com/vet-rescues-kitten-shelter-nearly-faints-sees-inside-ear/",
  "https://thebestcatpage.com/family-sees-soaking-wet-creature-clinging-oysters-leap-action-realize-tiny/",
  "https://thebestcatpage.com/two-lost-kittens-had-nothing-but-each-other/",
  "https://thebestcatpage.com/orphaned-kitten-suffering-injured-foot-asked-couple-help-will-make/",
  "https://thebestcatpage.com/kitten-rescued-firefighter-now-best/",
  "https://thebestcatpage.com/almost-100-cats-crammed-filthy-apartment-backyard-breeder/",
  "https://thebestcatpage.com/cat-re-assuringly-nuzzles-kitten-dumped/",
  "https://thebestcatpage.com/20-oldest-kitty-cats-adopted-people-biggest-hearts/",
  "https://thebestcatpage.com/9-great-tips-understanding-cats-trying-tell-tails/",
  "https://thebestcatpage.com/wanted-foster-parents-fluffy-kitten-bigger-plans/",
  "https://thebestcatpage.com/senior-cat-cried-help-shelter-one-person-didnt-hesitate/",
  "https://thebestcatpage.com/cat-arrives-familys-doorstep-meowing-pain/",
  "https://thebestcatpage.com/woman-spends-whole-paycheck-order-save/",
  "https://thebestcatpage.com/pet-cat-shocks-family-unexpected-present-luckily-knew-just/",
  "https://thebestcatpage.com/17-surprising-ways-cat-tells-love/",
  "https://thebestcatpage.com/man-opened-box-abandoned-bus-terminal-direct-sunlight-discover-saddest-surprise-can-imagine/",
  "https://thebestcatpage.com/cats-human-sends-hilarious-apology-note-to-neighbors-after-cat-steals-their-underwear/",
  "https://thebestcatpage.com/this-cat-transforms-a-lonely-85-year-old-stranger-into-a-kid-again/",
  "https://thebestcatpage.com/loving-mama-cat-proceeds-nurse-14-little-babies-back/",
  "https://thebestcatpage.com/24-funny-photos-prove-cats-just-petty-humans/",
  "https://thebestcatpage.com/man-who-lives-with-300-rescued-cats-transformed-his-home-into-wonderful-cat-land/",
  "https://thebestcatpage.com/man-rescued-a-stray-cat-5-years-ago-and-she-hasnt-stopped-cuddles-his-arm/",
  "https://thebestcatpage.com/amazing-nurse-kitty-poland-looks-animals-animal-shelter/",
  "https://thebestcatpage.com/kittys-paws-painted-purple-saddest-reason/",
  "https://thebestcatpage.com/paralyzed-kitty-gets-first-acupuncture-treatment-results/",
  "https://thebestcatpage.com/shelter-adorably-illustrates-cat-thoughts-help-get-adopted/",
  "https://thebestcatpage.com/cat-fell-high-rise-building-loses-leg-refuses/",
  "https://thebestcatpage.com/poor-kitten-left-freeze-death-right-middle-street/",
];

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
        dataRaw = dataRaw + `<p>${$(element).children().text()}</p> `;
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

    return { title: titlePost.text(), dataPost: dataPost.children().text() };
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

      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: dataTitleParam,
        temperature: 0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const new_title_tml = completion.data.choices[0].text;
      const new_title = new_title_tml.replace(/[\r\n]/gm, "");

      console.log("old titlePost : ", title);
      console.log("new titlePost : ", new_title);

      // post to blogger website

      const res = await blogger.posts.insert({
        blogId: process.env.BLOG_ID,
        requestBody: {
          published: startTime,
          labels: ["Rescue story"],
          title: new_title,
          content: dataPost,
        },
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

// checkDataPost(
//   "https://thebestcatpage.com/a-bit-of-love-and-petting-brought-this-street-kitten-back-to-life/",
// );

// runCrawlAndPostAllLink();

runCrawlAndPostSelectLink();

// async function createTime() {
//   const startTime = formatRFC3339(new Date());
//   console.log("startTimestartTime: ", startTime);
//   var next4Hours = formatRFC3339(addHours(parseISO(startTime), 4));
//   console.log("next4Hours : ", next4Hours);
// }

// createTime();
