  if ($(element).html().includes("<img")) {
      const imgHtml = $(element).html();

      const img = $(`<div>${imgHtml}</div>`).html();

      // console.log("img: ", $(img).attr("src"));
      // console.log("img: ", $(img).attr("width"));
      // console.log("img: ", $(img).attr("height"));

      // dataRaw = rawHTML + `<img src="${$(element).find("a").attr("href")}"/>`;
      // origin
      //  dataRaw = dataRaw + `<p>${$(element).children().text()}</p> `;

      var imgList = $(element).find("table > tbody > tr > td > img");

      if (imgList.length > 0) {
        var listImageHTML = [];
        var dataRawTmp = `<div style="
        display: flex;
        justify-content: space-between;">`;
        for (var imgItem of imgList) {
          const imgNode = imgItem.attribs;
          var nameImage = imgNode.class.split(" ")[2].replace(/\s/g, "");
          const { imgSrc, isOk, message } = await getLinkImage(
            imgNode.src,
            nameImage,
            isUsingDrive
          );
          // console.log("imgSrc: ", imgSrc);

          if (isOk === false) {
            isOkResult = isOk;
            messageResult = message;
            break;
          }

          const imgHtmlRaw = `<img src="${imgSrc}" width="${imgNode.width}px" height="${imgNode.height}px"/>`;
          listImageHTML.push(imgHtmlRaw);
        }

        for (var htmlRaw of listImageHTML) {
          const percentset = 100 / listImageHTML.length;
          const htmlRawTmp = `<div style="max-width: ${percentset}%;">${htmlRaw}</div>`;
          dataRawTmp = `${dataRawTmp} ${htmlRawTmp}`;
        }
        dataRawTmp = `${dataRawTmp}</div>`;
        dataRaw = dataRaw + dataRawTmp;
      } else {
        var nameImage = $(img).attr("class").split(" ")[2].replace(/\s/g, "");

        // var random = Math.floor(Math.random() * 1000000);
        // var nameImage = `body-image-${random}`;

        const { imgSrc, isOk, message } = await getLinkImage(
          $(img).attr("src"),
          nameImage,
          isUsingDrive
        );
        // console.log("imgSrc: ", imgSrc);

        if (isOk === false) {
          isOkResult = isOk;
          messageResult = message;
          break;
        }

        dataRaw =
          dataRaw +
          `<p><img src="${imgSrc}" width="${$(img).attr("width")}" height="${$(
            img
          ).attr("height")}"/></p> `;
      }
    } else if (element.children[0].parent.name == "h2") {
      const h2Tag = $(element).html();

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
    } else {
      const pContent = $(element).html();

      if (isUsingOpenAPI) {
        const dataTitleParam =
          usedLavmod && !runed
            ? `As the administrator of a website named LavMod, rewrite the following passage:: "${pContent}"`
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
    }