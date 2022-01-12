import express, { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;
    console.log(image_url);

    if (!image_url) {
      return res.status(400).send("Image url is required");
    }

    function validateUrl(value: string) {
      return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        value
      );
    }

    function checkUrlImage(url: string) {
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }

    if (!validateUrl(image_url)) {
      return res.status(500).send("Invalid url");
    }

    if (!checkUrlImage(image_url)) {
      return res.status(500).send("Invalid image url");
    }

    return filterImageFromURL(image_url)
      .then((result) =>
        res.status(200).sendFile(result, () => {
          deleteLocalFiles([result]);
        })
      )
      .catch((e) => res.status(500).send("Error in processing filter"));
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("Welcome");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
