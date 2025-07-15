import { Country } from './countries.interface';

export const EMPTY_COUNTRY: Country = {
  name: {
    common: '',
    official: '',
    nativeName: {
      deu: {
        official: '',
        common: ''
      }
    }
  },
  tld: [],
  cca2: '',
  ccn3: '',
  cioc: '',
  independent: false,
  status: '',
  unMember: false,
  currencies: {
    EUR: {
      symbol: '',
      name: ''
    }
  },
  idd: {
    root: '',
    suffixes: []
  },
  capital: [],
  altSpellings: [],
  region: '',
  subregion: '',
  languages: {
    deu: ''
  },
  latlng: [],
  landlocked: false,
  borders: [],
  area: 0,
  demonyms: {
    eng: { f: '', m: '' },
    fra: { f: '', m: '' }
  },
  cca3: '',
  translations: {
    spa: {
      official: '',
      common: ''
    }
  },
  flag: '',
  maps: {
    googleMaps: '',
    openStreetMaps: ''
  },
  population: 0,
  gini: {
    '2016': 0
  },
  fifa: '',
  car: {
    signs: [],
    side: ''
  },
  timezones: [],
  continents: [],
  flags: {
    png: '',
    svg: '',
    alt: ''
  },
  coatOfArms: {
    png: '',
    svg: ''
  },
  startOfWeek: '',
  capitalInfo: {
    latlng: []
  },
  postalCode: {
    format: '',
    regex: ''
  },

  favorites: false
};
