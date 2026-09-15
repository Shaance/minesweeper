const maps = {
  flag: '...##... ...####. ...##### ...####. ...##... ...#.... .####... ######..',
  mine: '...##... .#.##.#. ..####.. #######. ##o####. ..####.. .#.##.#. ...##...',
  boom: '#..#..#. .#.#.#.. ..###... #######. ..###... .#.#.#.. #..#..#. ........',
  face: '..####.. .######. ##e##e## ######## ##m##m## ###mm### .######. ..####..',
  worried: '..####.. .######. ##e##e## ######## ###mm### ##m##m## .######. ..####..',
  dead: '..####.. .######. #x#xx#x# ##x##x## #x#xx#x# ##mmmm## .######. ..####..',
  cool: '..####.. .######. ssssssss #ss##ss# ######## ##m##m## .#mmmm#. ..####..',
} as const;

export type SpriteName = keyof typeof maps;

// Only these fixed maps produce markup; no user content enters the SVG.
export function renderSprite(name: SpriteName): string {
  const pixels = maps[name].split(' ').flatMap((row, y) =>
    [...row].flatMap((pixel, x) => pixel === '.' ? [] : [
      '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' +
      (pixel === '#' ? 'currentColor' : 'var(--bg)') + '"/>',
    ]),
  );
  return '<svg viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">' +
    pixels.join('') + '</svg>';
}
