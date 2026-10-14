import type { ContactGender } from '../types/conversation'

const areaCodes = [11, 21, 31, 41, 51, 61, 71, 81, 85, 91]
const names: Record<ContactGender, string[]> = {
  woman: ['Ana Souza', 'Beatriz Lima', 'Camila Costa', 'Diana Alves', 'Fernanda Rocha'],
  man: ['Bruno Souza', 'Caio Lima', 'Daniel Costa', 'Eduardo Alves', 'Felipe Rocha'],
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomDigit(): number {
  return Math.floor(Math.random() * 10)
}

export function generateContact(gender: ContactGender) {
  const areaCode = randomItem(areaCodes)
  const firstPart = `9${Array.from({ length: 4 }, randomDigit).join('')}`
  const secondPart = Array.from({ length: 4 }, randomDigit).join('')

  return {
    number: `(${areaCode}) ${firstPart}-${secondPart}`,
    name: randomItem(names[gender]),
  }
}
