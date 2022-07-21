function downloadUrl(url: string, filename: string) {
  fetch(url, { mode: "no-cors" })
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch(console.error);
}

export {
  downloadUrl
}