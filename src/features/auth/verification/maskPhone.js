// "08012345678" -> "0801••••678". Shows enough for the person to recognise their number and no more.
export function maskPhone(phoneNumber) {
  return `${phoneNumber.slice(0, 4)}••••${phoneNumber.slice(-3)}`;
}
