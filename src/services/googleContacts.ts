export interface GoogleContact {
  resourceName: string;
  etag: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  company?: string;
  jobTitle?: string;
}

export async function fetchGoogleContacts(accessToken: string): Promise<GoogleContact[]> {
  const personFields = 'names,emailAddresses,phoneNumbers,photos,organizations';
  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=${personFields}&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google Contacts: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const connections = data.connections || [];

  return connections.map((c: any) => {
    const primaryName = c.names?.[0]?.displayName || 'Unnamed Contact';
    const primaryEmail = c.emailAddresses?.[0]?.value || '';
    const primaryPhone = c.phoneNumbers?.[0]?.value || '';
    const photoUrl = c.photos?.[0]?.url || '';
    const org = c.organizations?.[0]?.name || '';
    const title = c.organizations?.[0]?.title || '';

    return {
      resourceName: c.resourceName,
      etag: c.etag,
      name: primaryName,
      email: primaryEmail,
      phoneNumber: primaryPhone,
      photoUrl,
      company: org,
      jobTitle: title,
    };
  });
}
