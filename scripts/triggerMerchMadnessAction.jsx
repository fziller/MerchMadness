// #target photoshop

// Open the model file which was copied before

try {
  // Load automation
  app.load(File($.getenv("ACTION_FILE")));

  // Copy the image into the clipboard
  var shirtImage = File($.getenv("SHIRT_FILE"));
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  var modelFile = File($.getenv("MODEL_FILE"));
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  var layers = app.activeDocument.artLayers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === $.getenv("LAYER_NAME")) {
      app.activeDocument.activeLayer = layers[i];
      break;
    }
  }

  // 1st param is name of action, second is set of actions.
  // TODO i18n can make this one complicated
  app.doAction($.getenv("ACTION_NAME"), "Standardaktionen");

  // Navigate back to modelfile
  open(modelFile);

  // // Save the file to jpg after action is successful
  var file = new File($.getenv("RESULT_FILE_PATH"));
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("My self written error alert: " + e.message);
}
