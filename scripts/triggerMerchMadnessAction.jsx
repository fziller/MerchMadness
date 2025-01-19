// #target photoshop

// Open the model file which was copied before

try {
  // Copy the image into the clipboard
  var shirtImage = File(
    app.path + "/Presets/Scripts/T-shirt_Women_Motiv1.webp"
  );
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  var modelFile = File(app.path + "/Presets/Scripts/T-shirt_Women_Model.psb");
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  var layers = app.activeDocument.artLayers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === "T-shirt_women") {
      app.activeDocument.activeLayer = layers[i];
      break;
    }
  }

  //   // 1st param is name of action, second is set of actions.
  //   // TODO i18n can make this one complicated
  app.doAction("Impericon_T-shirt_Woman", "Standardaktionen");

  // Navigate back to modelfile
  open(modelFile);

  //   // Save the file to jpg after action is successful
  var file = new File("~/Downloads/merchmadness_result.jpg");
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);

  // Optional: Bild öffnen
  // var filePath = "/Pfad/zu/deinem/Bild.jpg";
  // var imageFile = new File(filePath);
  // app.open(imageFile);
} catch (e) {
  alert("My self written error alert: " + e.message);
}

function logLayerNames(layers) {
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].typename === "ArtLayer") {
      $.writeln("Layer: " + layers[i].name);
    } else if (layers[i].typename === "LayerSet") {
      $.writeln("Group: " + layers[i].name);
      logLayerNames(layers[i].layers);
    }
  }
}

logLayerNames(app.activeDocument.layers);
