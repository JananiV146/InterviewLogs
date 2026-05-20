export const validateCollegeEmail = (email) => {
  const allowedDomains = (process.env.COLLEGE_EMAIL_DOMAINS || '').split(',');
  const domain = email.split('@')[1];
  return allowedDomains.some((d) => domain.endsWith(d.trim()));
};
