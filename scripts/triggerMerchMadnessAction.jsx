// #target photoshop

// Open the model file which was copied before

var debugStep = 1;

try {
  while (app.documents.length > 0) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
  }
  // Load automation
  app.load(File("/Users/fziller/git/MerchMadness/photoshop/Impericon_T-shirt_Woman.atn"));
  debugStep = 2;
  // Copy the image into the clipboard
  var shirtImage = File("/Users/fziller/git/MerchMadness/public/uploads/shirt_1737534294102_T_shirt_gro__esMotiv_3.webp");
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  debugStep = 3;
  var modelFile = File("/Users/fziller/git/MerchMadness/public/uploads/model_doc_1737473410644_Longsleeve_man.psd");
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  debugStep = 4;
  // var layers = app.activeDocument.artLayers;
  // for (var i = 0; i < layers.length; i++) {
  //   if (layers[i].name === $.getenv("LAYER_NAME")) {
  //     app.activeDocument.activeLayer = layers[i];
  //     break;
  //   }
  // }

  // 1st param is name of action, second is set of actions.
  // TODO i18n can make this one complicated
  debugStep = 5;
  app.doAction("Impericon_T-shirt_Woman", "Standardaktionen");

  debugStep = 6;
  // Navigate back to modelfile
  open(modelFile);

  debugStep = 7;
  // // Save the file to jpg after action is successful
  var file = new File("/Users/fziller/git/MerchMadness/public/uploads/result_2_3_xso6gOi_.jpg");
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("Error on step " + debugStep + ": " + e.message);
}
