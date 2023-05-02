document.addEventListener("DOMContentLoaded", async () => {
  const annotatedUrls = document.getElementById("annotatedUrls");

  chrome.storage.local.get("annotatedUrls", (data) => {
    if (data.annotatedUrls) {
      data.annotatedUrls.forEach((urlData) => {
        annotateUrl(
          urlData.url,
          urlData.description,
          urlData.number,
          urlData.title,
          data.annotatedUrls
        );
      });

      renderChart(data.annotatedUrls);
    }
  });

  await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        if (!annotatedUrls.some((urlData) => urlData.url === currentUrl)) {
          annotateUrl(currentUrl);
          saveAnnotatedUrl(currentUrl);
        }
        resolve();
      });
    });
  });

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
        annotatedUrls = annotatedUrls.filter(
          (urlData) => urlData.url !== request.url
        );
        chrome.storage.local.set({ annotatedUrls: annotatedUrls }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    }
  });

  function annotateUrl(
    url,
    description = "",
    number = 0,
    title = "",
    annotatedUrls = null
  ) {
    const template = document.getElementById("urlItemTemplate");
    const urlItem = template.content.cloneNode(true);

    const rowNumber = urlItem.querySelector(".rowNumber");
    const tbody = document.querySelector("#annotatedUrls tbody");
    rowNumber.textContent = tbody.getElementsByTagName("tr").length + 1;

    const urlSpan = urlItem.querySelector(".urlSpan");
    const shortenedUrl = shortenUrl(url);
    const urlAnchor = document.createElement("a");
    urlAnchor.href = url;
    urlAnchor.textContent = shortenedUrl;
    urlAnchor.target = "_blank";
    urlSpan.textContent = "";
    urlSpan.appendChild(urlAnchor);

    const annotationInput = urlItem.querySelector(".annotationInput");
    annotationInput.value = description;
    annotationInput.addEventListener("input", async () => {
      await updateAnnotatedUrl(
        url,
        annotationInput.value,
        numberInput.value,
        titleInput.value
      );
      if (annotatedUrls) {
        renderChart(annotatedUrls);
      }
    });

    const numberInput = urlItem.querySelector(".numberInput");
    numberInput.value = number === "" ? 0 : number;
    numberInput.style.color = numberInput.value >= 0 ? "green" : "red";
    numberInput.addEventListener("input", async () => {
      numberInput.style.color = numberInput.value >= 0 ? "green" : "red";
      await updateAnnotatedUrl(
        url,
        annotationInput.value,
        numberInput.value,
        titleInput.value
      );
      if (annotatedUrls) {
        renderChart(annotatedUrls);
      }
    });

    const titleInput = urlItem.querySelector(".titleInput");
    titleInput.value = title;
    titleInput.addEventListener("input", async () => {
      await updateAnnotatedUrl(
        url,
        annotationInput.value,
        numberInput.value,
        titleInput.value
      );
      if (annotatedUrls) {
        renderChart(annotatedUrls);
      }
    });

    const removeBtn = urlItem.querySelector(".removeBtn");
    removeBtn.addEventListener("click", () => {
      const parentRow = removeBtn.closest("tr");
      tbody.removeChild(parentRow);
      removeAnnotatedUrl(url);
      updateRowNumbers(tbody);
    });

    tbody.appendChild(urlItem);
  }

  function shortenUrl(url, maxLength = 30) {
    if (url.length <= maxLength) {
      return url;
    }

    const startLength = Math.floor((maxLength - 3) / 2);
    const endLength = maxLength - 3 - startLength;
    return url.slice(0, startLength) + "..." + url.slice(-endLength);
  }

  function updateRowNumbers(tbody) {
    const rows = tbody.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
      const rowNumber = rows[i].querySelector(".rowNumber");
      rowNumber.textContent = i + 1;
    }
  }

  function saveAnnotatedUrl(url) {
    chrome.storage.local.get("annotatedUrls", (data) => {
      let annotatedUrls = data.annotatedUrls || [];
      annotatedUrls.push({ url: url, description: "", number: "", title: "" }); // Add title here
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

  function updateAnnotatedUrl(url, description, number, title) {
    return new Promise((resolve) => {
      chrome.storage.local.get("annotatedUrls", (data) => {
        let annotatedUrls = data.annotatedUrls || [];
        const index = annotatedUrls.findIndex((urlData) => urlData.url === url);
        if (index !== -1) {
          annotatedUrls[index].description = description;
          annotatedUrls[index].number = parseInt(number) || 0;
          annotatedUrls[index].title = title;
          chrome.storage.local.set({ annotatedUrls: annotatedUrls }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
 
});

// Initialize the chart outside of the DOMContentLoaded event listener
let chart;

function renderChart(data) {
  const ctx = document.getElementById("urlChart").getContext("2d");

  const labels = data.map((item) => item.title);
  const values = data.map((item) =>
    item.number === "" ? 0 : parseInt(item.number)
  );

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number",
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
