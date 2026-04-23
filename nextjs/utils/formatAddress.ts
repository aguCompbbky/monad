export const formatAddress = (address: string, left = 6, right = 4) => {
  if (!address || address.length <= left + right) return address;
  return `${address.slice(0, left)}...${address.slice(-right)}`;
};
