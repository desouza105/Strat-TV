/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlaylistSource {
  name: string;
  url: string;
  code?: string; // ISO 3166-1 alpha-2 code for flagcdn
  category: 'Country' | 'Language' | 'Genre';
}

export const getCustomPlaylists = (): PlaylistSource[] => {
  try {
    const saved = localStorage.getItem('moody-custom-playlists');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export const saveCustomPlaylist = (playlist: PlaylistSource) => {
  const current = getCustomPlaylists();
  const filtered = current.filter(p => p.url !== playlist.url);
  const next = [playlist, ...filtered].slice(0, 10);
  localStorage.setItem('moody-custom-playlists', JSON.stringify(next));
};

export const deleteCustomPlaylist = (url: string) => {
  const current = getCustomPlaylists();
  localStorage.setItem('moody-custom-playlists', 
    JSON.stringify(current.filter(p => p.url !== url)));
};

export const PORTAL_SOURCES: PlaylistSource[] = [
  { name: 'Afghanistan', url: 'https://ip-tv.app/Afghanistan', code: 'af', category: 'Country' },
  { name: 'Albanie', url: 'https://ip-tv.app/Albania', code: 'al', category: 'Country' },
  { name: 'Algérie', url: 'https://ip-tv.app/Algeria', code: 'dz', category: 'Country' },
  { name: 'Andorre', url: 'https://ip-tv.app/Andorra', code: 'ad', category: 'Country' },
  { name: 'Angola', url: 'https://ip-tv.app/Angola', code: 'ao', category: 'Country' },
  { name: 'Antigua-Barbuda', url: 'https://ip-tv.app/Antigua-Barbuda', code: 'ag', category: 'Country' },
  { name: 'Argentine', url: 'https://ip-tv.app/Argentina', code: 'ar', category: 'Country' },
  { name: 'Arménie', url: 'https://ip-tv.app/Armenia', code: 'am', category: 'Country' },
  { name: 'Australie', url: 'https://ip-tv.app/Australia', code: 'au', category: 'Country' },
  { name: 'Autriche', url: 'https://ip-tv.app/Austria', code: 'at', category: 'Country' },
  { name: 'Azerbaïdjan', url: 'https://ip-tv.app/Azerbaijan', code: 'az', category: 'Country' },
  { name: 'Bahamas', url: 'https://ip-tv.app/Bahamas', code: 'bs', category: 'Country' },
  { name: 'Bahreïn', url: 'https://ip-tv.app/Bahrain', code: 'bh', category: 'Country' },
  { name: 'Bangladesh', url: 'https://ip-tv.app/Bangladesh', code: 'bd', category: 'Country' },
  { name: 'Barbade', url: 'https://ip-tv.app/Barbados', code: 'bb', category: 'Country' },
  { name: 'Bélarus', url: 'https://ip-tv.app/Belarus', code: 'by', category: 'Country' },
  { name: 'Belgique', url: 'https://ip-tv.app/Belgium', code: 'be', category: 'Country' },
  { name: 'Belize', url: 'https://ip-tv.app/Belize', code: 'bz', category: 'Country' },
  { name: 'Bénin', url: 'https://ip-tv.app/Benin', code: 'bj', category: 'Country' },
  { name: 'Bhoutan', url: 'https://ip-tv.app/Bhutan', code: 'bt', category: 'Country' },
  { name: 'Bolivie', url: 'https://ip-tv.app/Bolivia', code: 'bo', category: 'Country' },
  { name: 'Bosnie', url: 'https://ip-tv.app/Bosnia-Herzegovina', code: 'ba', category: 'Country' },
  { name: 'Botswana', url: 'https://ip-tv.app/Botswana', code: 'bw', category: 'Country' },
  { name: 'Brésil', url: 'https://ip-tv.app/Brazil', code: 'br', category: 'Country' },
  { name: 'Bulgarie', url: 'https://ip-tv.app/Bulgaria', code: 'bg', category: 'Country' },
  { name: 'Burkina Faso', url: 'https://ip-tv.app/Burkina-Faso', code: 'bf', category: 'Country' },
  { name: 'Burundi', url: 'https://ip-tv.app/Burundi', code: 'bi', category: 'Country' },
  { name: 'Cambodge', url: 'https://ip-tv.app/Cambodia', code: 'kh', category: 'Country' },
  { name: 'Cameroun', url: 'https://ip-tv.app/Cameroon', code: 'cm', category: 'Country' },
  { name: 'Canada', url: 'https://ip-tv.app/Canada', code: 'ca', category: 'Country' },
  { name: 'Cap-Vert', url: 'https://ip-tv.app/Cape-Verde', code: 'cv', category: 'Country' },
  { name: 'Tchad', url: 'https://ip-tv.app/Chad', code: 'td', category: 'Country' },
  { name: 'Chili', url: 'https://ip-tv.app/Chile', code: 'cl', category: 'Country' },
  { name: 'Chine', url: 'https://ip-tv.app/China', code: 'cn', category: 'Country' },
  { name: 'Colombie', url: 'https://ip-tv.app/Colombia', code: 'co', category: 'Country' },
  { name: 'Comores', url: 'https://ip-tv.app/Comoros', code: 'km', category: 'Country' },
  { name: 'Costa Rica', url: 'https://ip-tv.app/Costa-Rica', code: 'cr', category: 'Country' },
  { name: 'Croatie', url: 'https://ip-tv.app/Croatia', code: 'hr', category: 'Country' },
  { name: 'Cuba', url: 'https://ip-tv.app/Cuba', code: 'cu', category: 'Country' },
  { name: 'Chypre', url: 'https://ip-tv.app/Cyprus', code: 'cy', category: 'Country' },
  { name: 'République Tchèque', url: 'https://ip-tv.app/Czech-Republic', code: 'cz', category: 'Country' },
  { name: 'Danemark', url: 'https://ip-tv.app/Denmark', code: 'dk', category: 'Country' },
  { name: 'Djibouti', url: 'https://ip-tv.app/Djibouti', code: 'dj', category: 'Country' },
  { name: 'Dominique', url: 'https://ip-tv.app/Dominica', code: 'dm', category: 'Country' },
  { name: 'Rép. Dominicaine', url: 'https://ip-tv.app/Dominican-Republic', code: 'do', category: 'Country' },
  { name: 'Équateur', url: 'https://ip-tv.app/Ecuador', code: 'ec', category: 'Country' },
  { name: 'Égypte', url: 'https://ip-tv.app/Egypt', code: 'eg', category: 'Country' },
  { name: 'Salvador', url: 'https://ip-tv.app/El-Salvador', code: 'sv', category: 'Country' },
  { name: 'Estonie', url: 'https://ip-tv.app/Estonia', code: 'ee', category: 'Country' },
  { name: 'Éthiopie', url: 'https://ip-tv.app/Ethiopia', code: 'et', category: 'Country' },
  { name: 'Fidji', url: 'https://ip-tv.app/Fiji', code: 'fj', category: 'Country' },
  { name: 'Finlande', url: 'https://ip-tv.app/Finland', code: 'fi', category: 'Country' },
  { name: 'France', url: 'https://ip-tv.app/France', code: 'fr', category: 'Country' },
  { name: 'Gabon', url: 'https://ip-tv.app/Gabon', code: 'ga', category: 'Country' },
  { name: 'Gambie', url: 'https://ip-tv.app/Gambia', code: 'gm', category: 'Country' },
  { name: 'Géorgie', url: 'https://ip-tv.app/Georgia', code: 'ge', category: 'Country' },
  { name: 'Allemagne', url: 'https://ip-tv.app/Germany', code: 'de', category: 'Country' },
  { name: 'Ghana', url: 'https://ip-tv.app/Ghana', code: 'gh', category: 'Country' },
  { name: 'Grèce', url: 'https://ip-tv.app/Greece', code: 'gr', category: 'Country' },
  { name: 'Grenade', url: 'https://ip-tv.app/Grenada', code: 'gd', category: 'Country' },
  { name: 'Guatemala', url: 'https://ip-tv.app/Guatemala', code: 'gt', category: 'Country' },
  { name: 'Guinée', url: 'https://ip-tv.app/Guinea', code: 'gn', category: 'Country' },
  { name: 'Guyana', url: 'https://ip-tv.app/Guyana', code: 'gy', category: 'Country' },
  { name: 'Haïti', url: 'https://ip-tv.app/Haiti', code: 'ht', category: 'Country' },
  { name: 'Honduras', url: 'https://ip-tv.app/Honduras', code: 'hn', category: 'Country' },
  { name: 'Hong Kong', url: 'https://ip-tv.app/Hong-Kong', code: 'hk', category: 'Country' },
  { name: 'Hongrie', url: 'https://ip-tv.app/Hungary', code: 'hu', category: 'Country' },
  { name: 'Islande', url: 'https://ip-tv.app/Iceland', code: 'is', category: 'Country' },
  { name: 'Inde', url: 'https://ip-tv.app/India', code: 'in', category: 'Country' },
  { name: 'Indonésie', url: 'https://ip-tv.app/Indonesia', code: 'id', category: 'Country' },
  { name: 'Iran', url: 'https://ip-tv.app/Iran', code: 'ir', category: 'Country' },
  { name: 'Iraq', url: 'https://ip-tv.app/Iraq', code: 'iq', category: 'Country' },
  { name: 'Irlande', url: 'https://ip-tv.app/Ireland', code: 'ie', category: 'Country' },
  { name: 'Israël', url: 'https://ip-tv.app/Israel', code: 'il', category: 'Country' },
  { name: 'Italie', url: 'https://ip-tv.app/Italy', code: 'it', category: 'Country' },
  { name: 'Côte d’Ivoire', url: 'https://ip-tv.app/Ivory-Coast', code: 'ci', category: 'Country' },
  { name: 'Jamaïque', url: 'https://ip-tv.app/Jamaica', code: 'jm', category: 'Country' },
  { name: 'Japon', url: 'https://ip-tv.app/Japan', code: 'jp', category: 'Country' },
  { name: 'Jordanie', url: 'https://ip-tv.app/Jordan', code: 'jo', category: 'Country' },
  { name: 'Kazakhstan', url: 'https://ip-tv.app/Kazakhstan', code: 'kz', category: 'Country' },
  { name: 'Kenya', url: 'https://ip-tv.app/Kenya', code: 'ke', category: 'Country' },
  { name: 'Koweït', url: 'https://ip-tv.app/Kuwait', code: 'kw', category: 'Country' },
  { name: 'Laos', url: 'https://ip-tv.app/Laos', code: 'la', category: 'Country' },
  { name: 'Lettonie', url: 'https://ip-tv.app/Latvia', code: 'lv', category: 'Country' },
  { name: 'Liban', url: 'https://ip-tv.app/Lebanon', code: 'lb', category: 'Country' },
  { name: 'Libéria', url: 'https://ip-tv.app/Liberia', code: 'lr', category: 'Country' },
  { name: 'Libye', url: 'https://ip-tv.app/Libya', code: 'ly', category: 'Country' },
  { name: 'Lituanie', url: 'https://ip-tv.app/Lithuania', code: 'lt', category: 'Country' },
  { name: 'Luxembourg', url: 'https://ip-tv.app/Luxembourg', code: 'lu', category: 'Country' },
  { name: 'Malaisie', url: 'https://ip-tv.app/Malaysia', code: 'my', category: 'Country' },
  { name: 'Maroc', url: 'https://ip-tv.app/Morocco', code: 'ma', category: 'Country' },
  { name: 'Mexique', url: 'https://ip-tv.app/Mexico', code: 'mx', category: 'Country' },
  { name: 'Monaco', url: 'https://ip-tv.app/Monaco', code: 'mc', category: 'Country' },
  { name: 'Pays-Bas', url: 'https://ip-tv.app/Netherlands', code: 'nl', category: 'Country' },
  { name: 'Norvège', url: 'https://ip-tv.app/Norway', code: 'no', category: 'Country' },
  { name: 'Pakistan', url: 'https://ip-tv.app/Pakistan', code: 'pk', category: 'Country' },
  { name: 'Panama', url: 'https://ip-tv.app/Panama', code: 'pa', category: 'Country' },
  { name: 'Pérou', url: 'https://ip-tv.app/Peru', code: 'pe', category: 'Country' },
  { name: 'Philippines', url: 'https://ip-tv.app/Philippines', code: 'ph', category: 'Country' },
  { name: 'Pologne', url: 'https://ip-tv.app/Poland', code: 'pl', category: 'Country' },
  { name: 'Portugal', url: 'https://ip-tv.app/Portugal', code: 'pt', category: 'Country' },
  { name: 'Qatar', url: 'https://ip-tv.app/Qatar', code: 'qa', category: 'Country' },
  { name: 'Russie', url: 'https://ip-tv.app/Russia', code: 'ru', category: 'Country' },
  { name: 'Arabie Saoudite', url: 'https://ip-tv.app/Saudi-Arabia', code: 'sa', category: 'Country' },
  { name: 'Sénégal', url: 'https://ip-tv.app/Senegal', code: 'sn', category: 'Country' },
  { name: 'Espagne', url: 'https://ip-tv.app/Spain', code: 'es', category: 'Country' },
  { name: 'Suède', url: 'https://ip-tv.app/Sweden', code: 'se', category: 'Country' },
  { name: 'Suisse', url: 'https://ip-tv.app/Switzerland', code: 'ch', category: 'Country' },
  { name: 'Thaïlande', url: 'https://ip-tv.app/Thailand', code: 'th', category: 'Country' },
  { name: 'Tunisie', url: 'https://ip-tv.app/Tunisia', code: 'tn', category: 'Country' },
  { name: 'Turquie', url: 'https://ip-tv.app/Turkey', code: 'tr', category: 'Country' },
  { name: 'Émirats Arabes Unis', url: 'https://ip-tv.app/UAE', code: 'ae', category: 'Country' },
  { name: 'Royaume-Uni', url: 'https://ip-tv.app/UK', code: 'gb', category: 'Country' },
  { name: 'USA', url: 'https://ip-tv.app/USA', code: 'us', category: 'Country' },
  { name: 'Vietnam', url: 'https://ip-tv.app/Vietnam', code: 'vn', category: 'Country' },
  
  // Genres
  { name: 'Afrique TV', url: 'https://tvradiozap.eu/live/d/tvzaf.m3u', category: 'Genre' },
  { name: 'Europa TV', url: 'https://tvradiozap.eu/live/d/tvzeu.m3u', category: 'Genre' },
  { name: 'World TV', url: 'https://tvradiozap.eu/live/d/tvrztv.m3u', category: 'Genre' },
  { name: 'Regional TV', url: 'https://tvradiozap.eu/live/d/tvzreg.m3u', category: 'Genre' },
  { name: 'Radio', url: 'https://tvradiozap.eu/live/x/vlc/d/tvrzra.m3u', category: 'Genre' },
  { name: 'Animation', url: 'https://ip-tv.app/Animation', category: 'Genre' },
  { name: 'Auto', url: 'https://ip-tv.app/Auto', category: 'Genre' },
  { name: 'Business', url: 'https://ip-tv.app/Business', category: 'Genre' },
  { name: 'Classique', url: 'https://ip-tv.app/Classic', category: 'Genre' },
  { name: 'Comédie', url: 'https://ip-tv.app/Comedy', category: 'Genre' },
  { name: 'Cuisine', url: 'https://ip-tv.app/Cooking', category: 'Genre' },
  { name: 'Culture', url: 'https://ip-tv.app/Culture', category: 'Genre' },
  { name: 'Documentaire', url: 'https://ip-tv.app/Documentary', category: 'Genre' },
  { name: 'Éducation', url: 'https://ip-tv.app/Education', category: 'Genre' },
  { name: 'Divertissement', url: 'https://ip-tv.app/Entertainment', category: 'Genre' },
  { name: 'Famille', url: 'https://ip-tv.app/Family', category: 'Genre' },
  { name: 'Kids', url: 'https://ip-tv.app/Kids', category: 'Genre' },
  { name: 'Lifestyle', url: 'https://ip-tv.app/Lifestyle', category: 'Genre' },
  { name: 'Films', url: 'https://ip-tv.app/Movies', category: 'Genre' },
  { name: 'Musique', url: 'https://ip-tv.app/Music', category: 'Genre' },
  { name: 'News', url: 'https://ip-tv.app/News', category: 'Genre' },
  { name: 'Sport', url: 'https://ip-tv.app/Sports', category: 'Genre' },
  { name: 'XXX ADULT', url: 'https://ip-tv.app/XXX', category: 'Genre' }
];
