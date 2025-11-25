export function formatDateDDMMYYYY(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return `${day}-${month}-${year}`
}

export function formatDateToDDMMMYYYY(isoString) {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' }) //.toUpperCase()
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export function formatDateDDMMYYYYHHMM(input) {
  const date = new Date(input);
  const day = String(date.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} @ ${hours}:${minutes}`;
}

export function restructureCustomers(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return {
      id: data.contact_id || null,
      name: fullName || null,
      organization_name: data.organization_name || null,
      job_title: data.job_title || null,
      phone: data.phone || null,
      email: data.email || null,
    };
  });
}

export function restructureOrganizations(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.organization_id,
      label: data.name
    };
  });
}

export function restructureRoles(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.role_id,
      label: data.role_name
    };
  });
}

export function restructureContacts(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.contact_id,
      label: `${data.first_name} ${data.last_name}`.trim()
    };
  });
}

export function restructureContactsWithOrganization(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.contact_id,
      label: `${data.first_name} ${data.last_name} (${data.organization_name || ''})`.trim(),
    };
  });
}

export function restructureStages(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.opportunities_stage_id,
      label: data.opportunities_stage_name.trim()
    };
  });
}

export function restructureServices(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  return dataArray.map((data) => {
    return {
      value: data.service_type_id,
      label: data.name.trim()
    };
  });
}


export const formatDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};
