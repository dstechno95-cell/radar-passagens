import { Airport } from './types';

export const airports: Airport[] = [
  // Brasil
  { iata: 'GRU', name: 'Guarulhos International', city: 'São Paulo', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'CGH', name: 'Congonhas', city: 'São Paulo', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'VCP', name: 'Viracopos International', city: 'Campinas', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'GIG', name: 'Galeão International', city: 'Rio de Janeiro', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'SDU', name: 'Santos Dumont', city: 'Rio de Janeiro', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'BSB', name: 'Brasília International', city: 'Brasília', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'SSA', name: 'Luís Eduardo Magalhães', city: 'Salvador', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'REC', name: 'Guararapes International', city: 'Recife', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'FOR', name: 'Pinto Martins International', city: 'Fortaleza', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'BEL', name: 'Val de Cans International', city: 'Belém', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'MAO', name: 'Eduardo Gomes International', city: 'Manaus', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'CWB', name: 'Afonso Pena International', city: 'Curitiba', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'POA', name: 'Salgado Filho International', city: 'Porto Alegre', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'FLN', name: 'Hercílio Luz International', city: 'Florianópolis', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'MCZ', name: 'Zumbi dos Palmares', city: 'Maceió', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'NAT', name: 'Grande São Gonçalo do Amarante', city: 'Natal', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'JPA', name: 'Castro Pinto International', city: 'João Pessoa', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'AJU', name: 'Santa Maria International', city: 'Aracaju', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'SLZ', name: 'Marechal Cunha Machado', city: 'São Luís', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'CGR', name: 'Campo Grande International', city: 'Campo Grande', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'CGB', name: 'Marechal Rondon International', city: 'Cuiabá', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'VIX', name: 'Eurico de Aguiar Salles', city: 'Vitória', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'GYN', name: 'Santa Genoveva', city: 'Goiânia', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'THE', name: 'Senador Petrônio Portella', city: 'Teresina', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'PMW', name: 'Brigadeiro Lysias Rodrigues', city: 'Palmas', country: 'Brasil', flag: '🇧🇷' },
  { iata: 'PVH', name: 'Governador Jorge Teixeira', city: 'Porto Velho', country: 'Brasil', flag: '🇧🇷' },
  // EUA
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'EUA', flag: '🇺🇸' },
  { iata: 'JFK', name: 'John F. Kennedy International', city: 'Nova York', country: 'EUA', flag: '🇺🇸' },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'EUA', flag: '🇺🇸' },
  { iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'EUA', flag: '🇺🇸' },
  { iata: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'EUA', flag: '🇺🇸' },
  // Europa
  { iata: 'LIS', name: 'Humberto Delgado International', city: 'Lisboa', country: 'Portugal', flag: '🇵🇹' },
  { iata: 'OPO', name: 'Francisco Sá Carneiro', city: 'Porto', country: 'Portugal', flag: '🇵🇹' },
  { iata: 'LHR', name: 'Heathrow', city: 'Londres', country: 'Reino Unido', flag: '🇬🇧' },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'França', flag: '🇫🇷' },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madri', country: 'Espanha', flag: '🇪🇸' },
  { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Espanha', flag: '🇪🇸' },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Alemanha', flag: '🇩🇪' },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdã', country: 'Holanda', flag: '🇳🇱' },
  { iata: 'FCO', name: 'Leonardo da Vinci', city: 'Roma', country: 'Itália', flag: '🇮🇹' },
  { iata: 'MXP', name: 'Milano Malpensa', city: 'Milão', country: 'Itália', flag: '🇮🇹' },
  { iata: 'ZRH', name: 'Zürich Airport', city: 'Zurique', country: 'Suíça', flag: '🇨🇭' },
  // Oriente Médio / Ásia
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'Emirados Árabes', flag: '🇦🇪' },
  { iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', flag: '🇶🇦' },
  { iata: 'NRT', name: 'Narita International', city: 'Tóquio', country: 'Japão', flag: '🇯🇵' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Tailândia', flag: '🇹🇭' },
  { iata: 'SIN', name: 'Changi Airport', city: 'Singapura', country: 'Singapura', flag: '🇸🇬' },
  // América do Sul
  { iata: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile', flag: '🇨🇱' },
  { iata: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷' },
  { iata: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colômbia', flag: '🇨🇴' },
  { iata: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', flag: '🇵🇪' },
  { iata: 'GEO', name: 'Cheddi Jagan International', city: 'Georgetown', country: 'Guiana', flag: '🇬🇾' },
  // América Central / México
  { iata: 'MEX', name: 'Felipe Ángeles International', city: 'Cidade do México', country: 'México', flag: '🇲🇽' },
  { iata: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'México', flag: '🇲🇽' },
  // Oceania
  { iata: 'SYD', name: 'Kingsford Smith Airport', city: 'Sydney', country: 'Austrália', flag: '🇦🇺' },
];

export const airportMap = new Map(airports.map((a) => [a.iata, a]));

export function getAirport(iata: string): Airport | undefined {
  return airportMap.get(iata.toUpperCase());
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function searchAirports(query: string): Airport[] {
  const q = normalize(query.trim());
  if (!q || q.length < 2) return airports.slice(0, 8);
  return airports.filter(
    (a) =>
      normalize(a.iata).includes(q) ||
      normalize(a.city).includes(q) ||
      normalize(a.name).includes(q) ||
      normalize(a.country).includes(q)
  ).slice(0, 8);
}
