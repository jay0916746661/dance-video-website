1. Open [script.google.com](https://script.google.com/).
2. Create a new Apps Script project.
3. Replace the default code with [Code.gs](/Users/jimlin/Downloads/跳舞影片網站/google-apps-script/Code.gs).
4. Click `Deploy` -> `New deployment`.
5. Choose `Web app`.
6. Set:
   `Execute as`: `Me`
   `Who has access`: `Anyone`
7. Copy the Web App URL.
8. Paste that URL into `DRIVE_FEED_URL` inside [Taiwan Zouk Festival.html](/Users/jimlin/Downloads/跳舞影片網站/Taiwan%20Zouk%20Festival.html:58) and [index.html](/Users/jimlin/Downloads/跳舞影片網站/index.html:58).

After that, every page load will fetch the latest public video list directly from your Drive folder.
