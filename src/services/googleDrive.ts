export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  size?: string;
  createdTime?: string;
}

export async function listDriveFiles(accessToken: string): Promise<DriveFile[]> {
  const query = "trashed = false and (mimeType contains 'image/' or name contains '.json' or name contains '.png' or name contains '.jpg' or name contains '.jpeg')";
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,thumbnailLink,webContentLink,size,createdTime)&q=${encodeURIComponent(
    query
  )}&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list Google Drive files: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

export async function uploadToDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  dataBlob: Blob
): Promise<DriveFile> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', dataBlob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload to Google Drive: ${response.status} ${err}`);
  }

  return response.json();
}

export async function downloadDriveFile(
  accessToken: string,
  fileId: string
): Promise<Blob> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download file from Google Drive: ${response.status}`);
  }

  return response.blob();
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete file from Google Drive: ${response.status}`);
  }
}
