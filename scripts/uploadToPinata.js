const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
const items = require("./items.json");
const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);

  // Filter the files in case the are a file that in not a .png
  const files = fs.readdirSync(fullImagesPath);

  let responses = [];
  console.log("Uploading to IPFS");

  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      await pinata
        .pinFileToIPFS(readableStreamForFile, options)
        .then((result) => {
          responses.push(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}
const main = async () => {
  const { responses, files } = await storeImages("../backend/images/");
  console.log(responses);
  console.log(files);
  const key = {
    name: "aCustomNameForYourUpload",
    keyvalues: {
      customKey: "customValue",
      customKey2: "customValue2",
    },
  };
  //   const response = await storeTokenUriMetadata(key);
  //   console.log(response);
};
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
