import Tesseract from 'tesseract.js';
import * as fs from 'fs'

fs.readFile('recaptcha/code.jpeg', (err, data) => {
    if (err) throw err;
    Tesseract.recognize(data)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
      });
  });
