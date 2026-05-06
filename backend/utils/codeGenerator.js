// Umumiy helper
function generateCode(length, chars) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// UniqueCode (10 belgili, harf + raqam)
function generateUniqueCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return generateCode(10, chars);
}

// LegacyCode (12 belgili, harf + raqam)
function generateLegacyCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return generateCode(12, chars);
}

// DeliveryCode (10 belgili, faqat katta harf + raqam, prefiks bilan)
function generateDeliveryCode() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return "DLV-" + generateCode(7, chars); // prefiks + 7 random = umumiy 11 belgili
}

// ManagerCode (8 belgili, prefiks bilan)
function generateManagerCode() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return "MGR-" + generateCode(5, chars);
}

// ExtraCode (EXT-XXXXXX format: 6 random alphanumeric characters)
function generateExtraCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return "EXT-" + generateCode(6, chars);
}

module.exports = {
  generateUniqueCode,
  generateLegacyCode,
  generateDeliveryCode,
  generateManagerCode,
  generateExtraCode,
};
