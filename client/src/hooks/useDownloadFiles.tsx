import JSZip from "jszip";
const useDownloadFiles = () => {
  const zipAndDownload = async (images: { resultUrl: string }[]) => {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    if (!imagesFolder) {
      throw new Error("Failed to create zip folder");
    }
    // TODO This needs to be replaced with the actually combined images
    if (!images) return;
    for (const image in images) {
      await fetch(images[image].resultUrl)
        .then(async (response) => {
          const ab = response.arrayBuffer();
          // TODO File extension needs to be changed (configurable?)
          imagesFolder.file(`${image}.jpg`, ab);
        })
        .catch((error) => {
          console.log("Fetch images", error);
        });
    }

    const zipContent = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(zipContent);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadFile = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "combined-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { zipAndDownload, downloadFile };
};

export default useDownloadFiles;
