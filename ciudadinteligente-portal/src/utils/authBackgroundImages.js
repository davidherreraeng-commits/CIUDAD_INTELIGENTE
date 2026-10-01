export const authBackgroundImages = [
  'https://i0.wp.com/acimedellin.org/wp-content/uploads/2019/11/medellin-newsweek-1.jpg?w=1584&ssl=1',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2021-02/_DSC4301.jpg?itok=S5FVfKfp',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2021-02/_DSC4014.jpg?itok=rpj9aMTB',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2020-07/_N4A8131.jpg?itok=aew9J_Wc',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2020-07/IMG_1157.jpg?itok=vCEDsRQt',
  'https://listingsprod.blob.core.windows.net/ourlistings-col/013b2272-7e12-469e-9748-bc9ece502f03/4f9ebedf-ba67-46c6-b245-8ae3699c8952-w',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2021-02/Sur-Norte%20IZQ.jpg?itok=rs7q8bLy',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2020-01/Medellin%202.jpg?itok=w4MOBC0f',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2020-01/PLANTA%20AMBIENTADA%20RIO1_1.jpg?itok=-OrJugea',
  'https://landscape.coac.net/sites/default/files/styles/reducir_calidad/public/2020-01/DJI_0892.jpg?itok=vzStL9Kp',
  'https://images.adsttc.com/media/images/5924/cae6/e58e/ce27/a400/089f/slideshow/2.jpg?1495583454',
  'https://www.semana.com/resizer/v2/4XK3J2XIJBCFXN7TVXIY2D5G2Y.jpg?auth=1a26953ce6bda998da33eccad78a984b70a1848432a25030003c4f9943c4270e&smart=true&quality=75&width=1280&height=720',
  'https://www.semana.com/resizer/v2/N724SCTYPNC6TL5PG4BIW7FECE.jpg?auth=710c272cd05ee12123d288c9d93ae53227c42b314606b410e44ffab67f3519b8&smart=true&quality=75&width=1280&height=720'
];

export const getRandomAuthBackground = () => {
  if (authBackgroundImages.length === 0) return null;

  const randomBuffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(randomBuffer);
  const randomIndex = randomBuffer[0] % authBackgroundImages.length;

  return authBackgroundImages[randomIndex];
};
