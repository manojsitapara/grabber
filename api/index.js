const cheerio = require("cheerio");
const axios = require("axios");
const usage = "https://metagrabber.vercel.app/api?url=https://discord.com"

async function meta(urrl) {
      const page = (await axios.get(urrl)).data;
      const $ = cheerio.load(page);
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
      const url = $('meta[property="og:url"]').attr('content')
      const site_name = $('meta[property="og:site_name"]').attr('content')
      let image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
      image = (image || "").replace(/amp;/g,"");
      const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
      const keywords = $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
      const json = { title, description, url : url || urrl, site_name, image: image || icon, icon, keywords };
      console.log(json)
      return json;
}

module.exports = async (request, response) => {
  const { url } = request.query;
  if (!url || url == "" || url == " ") {
    response.status(400).json({
      "success": false,
      "error": "No url query specified.",
      "usage": usage
    });
  } else {
    try {
      let metaRes = await meta(url)
      metaRes.success = true
      response.status(200).json(metaRes);
    } catch (error) {
        response.status(400).json({
          "success": false,
          url,
          erData: error,
          erMessage: error.message,
          "error": "The server encountered an error. You may have inputted an invalid query.",
          "usage": usage
       });
    }
  }
}
