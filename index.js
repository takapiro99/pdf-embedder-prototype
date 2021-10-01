const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

app.get("/order.pdf", (req, res) => {
  res.sendFile("order.pdf", { root: __dirname });
});

app.post("/go", async (req, res) => {
  console.log(req.body);
  const _name = req.body.name;
  const path = await exec(_name, `./out/${uuidv4()}.pdf`);
  console.log(path);
  res.send({ path: path });
});

app.get("/out/:path", (req, res) => {
  console.log(req.params.path);
  res.sendFile(req.params.path, { root: path.join(__dirname, "out") });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

const existingPdfBytes = fs.readFileSync("./order.pdf");

const exec = async (name, fileName = "modified.pdf") => {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  // Print all available metadata fields
  console.log("Title:", pdfDoc.getTitle());
  console.log("Author:", pdfDoc.getAuthor());
  console.log("Subject:", pdfDoc.getSubject());
  console.log("Creator:", pdfDoc.getCreator());
  console.log("Keywords:", pdfDoc.getKeywords());
  console.log("Producer:", pdfDoc.getProducer());
  console.log("Creation Date:", pdfDoc.getCreationDate());
  console.log("Modification Date:", pdfDoc.getModificationDate());

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // // Draw a string of text diagonally across the first page
  // firstPage.drawText("This text was added with JavaScript!", {
  //   x: 5,
  //   y: height / 2 + 300,
  //   size: 50,
  //   font: helveticaFont,
  //   color: rgb(0.95, 0.1, 0.1),
  //   rotate: degrees(-45),
  // });

  firstPage.drawText(name, {
    x: width * 0.25,
    y: height * 0.78,
    size: 32,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const pdfBytes = await pdfDoc.save();
  fs.appendFileSync(fileName, pdfBytes);
  return fileName;
};
