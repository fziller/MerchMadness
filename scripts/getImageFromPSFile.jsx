// #target photoshop

// Open the model file which was copied before

var debugStep = 1;

try {
  // Load automation
  var modelFile = File("/Users/fziller/git/MerchMadness/public/uploads/model_doc_1737532042046_T_shirt_man.psd");
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  debugStep = 2;

  // // Save the file to jpg after action is successful
  var file = new File("/Users/fziller/git/MerchMadness/public/uploads/model_img_-NoyshS4.jpg");
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("Error on step " + debugStep + ": " + e.message);
}
