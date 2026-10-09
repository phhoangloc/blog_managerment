import { slugify, uniqueSlug } from '../../src/utils/slugify';

describe('slugify', () => {
  it.each([
    ['Hello World!', 'hello-world'],
    ['Một tuần sống chậm ở Đà Lạt', 'mot-tuan-song-cham-o-da-lat'],
    ['  --Trim__me--  ', 'trim-me'],
    ['!!!', 'blog'],
  ])('%s -> %s', (input, expected) => expect(slugify(input)).toBe(expected));

  it('uniqueSlug appends -2, -3 until free', async () => {
    const taken = new Set(['a', 'a-2']);
    expect(await uniqueSlug('a', async (s) => taken.has(s))).toBe('a-3');
    expect(await uniqueSlug('b', async (s) => taken.has(s))).toBe('b');
  });
});
