document.addEventListener("DOMContentLoaded", () => {
    const annotatedUrls = document.getElementById("annotatedUrls");
  
    chrome.storage.local.get("annotatedUrls", (data) => {
      if (data.annotatedUrls) {
        data.annotatedUrls.forEach((urlData) => {
          annotateUrl(urlData.url, urlData.description, urlData.number);
        });
      }
    });
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        if (!annotatedUrls.some((urlData) => urlData.url === currentUrl)) {
          annotateUrl(currentUrl);
          saveAnnotatedUrl(currentUrl);
        }
      });
    });
  
    function annotateUrl(url, description = "", number = "") {
      const urlItem = document.createElement("div");
      urlItem.className = "urlItem";
  
      const urlSpan = document.createElement("span");
      urlSpan.textContent = url;
      urlItem.appendChild(urlSpan);
  
      const annotationInput = document.createElement("textarea");
      annotationInput.value = description;
      annotationInput.placeholder = "Add a longer description";
      urlItem.appendChild(annotationInput);
  
      const numberInput = document.createElement("input");
      numberInput.type = "number";
      numberInput.value = number;
      numberInput.placeholder = "Add a positive or negative number";
      numberInput.addEventListener("input", () => {
        numberInput.style.color = numberInput.value >= 0 ? "green" : "red";
      });
      urlItem.appendChild(numberInput);
  
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        annotatedUrls.removeChild(urlItem);
        removeAnnotatedUrl(url);
      });
      urlItem.appendChild(removeBtn);
  
      annotatedUrls.appendChild(urlItem);
    }
  
    function saveAnnotatedUrl(url) {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        annotatedUrls.push({ url: url, description: "", number: "" });
        chrome.storage.local.set({ annotatedUrls: annotatedUrls });
      });
    }
  
    function removeAnnotatedUrl(url) {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        annotatedUrls = annotatedUrls.filter((urlData) => urlData.url !== url);
        chrome.storage.local.set({ annotatedUrls: annotatedUrls });
      });
    }
  });
  