export interface Client {
  fullName: string;
  dni: number;
  status: "Activo" | "Inactivo";
  entryDate: Date;
  isPEP: boolean;
  isObligatedSubject: boolean | null;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Crear una instancia de un Cliente a partir de una línea de texto.
 * Se encarga de la validación, parseo y transformación de los datos crudos.
 * Lanza un ValidationError si los datos no son válidos.
 *
 * @param line - Una línea de formato "María|Gómez|45678901|Activo|11/13/2021|true|false"
 * @returns Instancia de un Client.
 */
export function createClientFromLine(line: string): Client {
  const parts = line.split("|");
  if (parts.length < 6) {
    throw new ValidationError(`La línea no tiene las 7 partes requeridas.`);
  }

  const [
    firstName,
    lastName,
    dniStr,
    status,
    entryDateStr,
    isPEPStr,
    isObligatedSubjectStr,
  ] = parts;

  // NombreCompleto
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  if (!fullName) {
    throw new ValidationError("El nombre o apellido no pueden estar vacíos.");
  }

  if (fullName.length > 100) {
    throw new ValidationError(
      "El nombre o apellido no pueden ser mayores a 100 caracteres."
    );
  }

  // DNI
  const dni = parseInt(dniStr, 10);
  if (isNaN(dni) || dni <= 0) {
    throw new ValidationError(`DNI inválido: "${dniStr}"`);
  }

  // Estado
  if (status !== "Activo" && status !== "Inactivo") {
    throw new ValidationError(`Estado inválido: "${status}"`);
  }

  // FechaIngreso (formato MM/DD/YYYY)
  const dateParts = entryDateStr.split("/");
  if (dateParts.length !== 3) {
    throw new ValidationError(`Formato de fecha inválido: "${entryDateStr}"`);
  }
  const [month, day, year] = dateParts.map((p) => parseInt(p, 10));
  const entryDate = new Date(year, month - 1, day);
  if (isNaN(entryDate.getTime()) || year < 1900 || year > 2100) {
    throw new ValidationError(
      `Fecha inválida o fuera de rango: "${entryDateStr}"`
    );
  }

  // EsPEP
  const isPEP = isPEPStr.toLowerCase() === "true";

  // EsSujetoObligado
  let isObligatedSubject: boolean | null = null;
  if (isObligatedSubjectStr && isObligatedSubjectStr.trim() !== "") {
    isObligatedSubject = isObligatedSubjectStr.toLowerCase() === "true";
  }

  return {
    fullName,
    dni,
    status,
    entryDate,
    isPEP,
    isObligatedSubject,
  };
}
