import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import sharp from 'sharp'
import { imageVariants } from '../src/data/imageVariants.js'

const publicRoot = new URL('../public/', import.meta.url)

test('all responsive previews exist, decode, and match their declared widths', async () => {
  assert.equal(Object.keys(imageVariants.gallery).length, 32)
  assert.equal(Object.keys(imageVariants.wallpapers).length, 3)
  for (const group of Object.values(imageVariants)) {
    for (const entry of Object.values(group)) {
      assert.ok(entry.width > 0 && entry.height > 0)
      for (const variant of entry.srcSet.split(', ')) {
        const [path, descriptor] = variant.split(' ')
        const metadata = await sharp(await readFile(new URL(path, publicRoot))).metadata()
        assert.equal(metadata.format, 'webp')
        assert.equal(metadata.width, Number.parseInt(descriptor))
        assert.ok(metadata.width <= entry.width)
        assert.ok(Math.abs(metadata.height / metadata.width - entry.height / entry.width) < 0.01)
      }
    }
  }
})

test('new wallpapers retain valid downloadable PNG originals and smaller web previews', async () => {
  for (const [file, entry] of Object.entries(imageVariants.wallpapers)) {
    const original = new URL(`wallpapers/${file}`, publicRoot)
    const metadata = await sharp(await readFile(original)).metadata()
    assert.equal(metadata.format, 'png')
    assert.equal(metadata.width, entry.width)
    assert.equal(metadata.height, entry.height)
    assert.ok((await stat(new URL(entry.preview, publicRoot))).size < (await stat(original)).size)
  }
})
