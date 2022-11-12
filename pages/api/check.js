import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

// set `<your-key>` and `<your-endpoint>` variables with the values from the Azure portal.
const key = process.env["FORM_RECOGNIZER_API_KEY"];
const endpoint = process.env["FORM_RECOGNIZER_ENDPOINT"];

// sample document
const businessCardURL =
  "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/business-card-english.jpg";

const BusinessCard = async (req, res) => {
  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const poller = await client.beginAnalyzeDocument(
    "prebuilt-businessCard",
    businessCardURL
  );

  const {
    documents: [result],
  } = await poller.pollUntilDone();

  if (result) {
    res.status(200).json({ result });
  }
};

export default BusinessCard;
