const FOLDER_ID = '1FWQYxw_np-4om33BIBuoQK5x3vqh48FX';

function doGet() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = [];
  const iter = folder.getFiles();

  while (iter.hasNext()) {
    const file = iter.next();
    const name = file.getName();
    if (!/\.(m4v|mp4|mov|avi|mkv|webm)$/i.test(name)) continue;
    files.push({
      id: file.getId(),
      name,
      mimeType: file.getMimeType(),
      updatedAt: file.getLastUpdated().toISOString(),
    });
  }

  files.sort((a, b) => a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  }));

  return ContentService
    .createTextOutput(JSON.stringify({
      folderId: FOLDER_ID,
      count: files.length,
      files,
      generatedAt: new Date().toISOString(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
