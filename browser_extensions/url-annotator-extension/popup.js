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

      // Merged code from background_worker.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getAnnotatedUrls") {
      chrome.storage.local.get("annotatedUrls", (data) => {
        sendResponse({ annotatedUrls: data.annotatedUrls });
      });
      return true;
    } else if (request.action === "saveAnnotatedUrl") {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        annotatedUrls.push(request.urlData);
        chrome.storage.local.set({ annotatedUrls: annotatedUrls }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    } else if (request.action === "removeAnnotatedUrl") {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        annotatedUrls = annotatedUrls.filter((urlData) => urlData.url !== request.url);
        chrome.storage.local.set({ annotatedUrls: annotatedUrls }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    }
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
      annotationInput.addEventListener("input", () => {
        updateAnnotatedUrl(url, annotationInput.value, numberInput.value);
      });
      urlItem.appendChild(annotationInput);
  
      const numberInput = document.createElement("input");
      numberInput.type = "number";
      numberInput.value = number;
      numberInput.placeholder = "Add a positive or negative number";
      numberInput.addEventListener("input", () => {
        numberInput.style.color = numberInput.value >= 0 ? "green" : "red";
        updateAnnotatedUrl(url, annotationInput.value, numberInput.value);
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

    function updateAnnotatedUrl(url, description, number) {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        const index = annotatedUrls.findIndex((urlData) => urlData.url === url);
        if (index !== -1) {
          annotatedUrls[index].description = description;
          annotatedUrls[index].number = number;
          chrome.storage.local.set({ annotatedUrls: annotatedUrls });
        }
      });
    }
  });
  