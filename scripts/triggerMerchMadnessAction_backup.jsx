// #target photoshop

// Open the model file which was copied before

var debugStep = 1;

try {
  while (app.documents.length > 0) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
  }
  // Load automation
  app.load(File($.getenv("ACTION_FILE")));
  debugStep = 2;
  // Copy the image into the clipboard
  var shirtImage = File($.getenv("SHIRT_FILE"));
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  debugStep = 3;
  var modelFile = File($.getenv("MODEL_FILE"));
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
  app.doAction($.getenv("ACTION_NAME"), "Standardaktionen");

  debugStep = 6;
  // Navigate back to modelfile
  open(modelFile);

  debugStep = 7;
  // // Save the file to jpg after action is successful
  var file = new File($.getenv("RESULT_FILE_PATH"));
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("Error on step " + debugStep + ": " + e.message);
}
