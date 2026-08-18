export function validateEmail(email: string): string | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "E-mail é obrigatório";
  if (!regex.test(email)) return "E-mail inválido";
  return null;
}

export function validateCPF(cpf: string): string | null {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return "CPF deve ter 11 dígitos";
  if (/^(\d)\1{10}$/.test(cleaned)) return "CPF inválido";

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cleaned[9])) return "CPF inválido";

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cleaned[10])) return "CPF inválido";

  return null;
}

export function validatePassword(senha: string): string | null {
  if (!senha) return "Senha é obrigatória";
  if (senha.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[a-z]/.test(senha)) return "Senha deve conter letra minúscula";
  if (!/[A-Z]/.test(senha)) return "Senha deve conter letra maiúscula";
  if (!/[0-9]/.test(senha)) return "Senha deve conter um número";
  if (!/[@$!%*?&.#_-]/.test(senha)) return "Senha deve conter um caractere especial (@$!%*?&.#_-)";
  return null;
}

export function validatePasswordMatch(senha: string, confirmar: string): string | null {
  if (senha !== confirmar) return "As senhas não coincidem";
  return null;
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
