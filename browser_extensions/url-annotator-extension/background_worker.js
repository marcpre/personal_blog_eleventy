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
  