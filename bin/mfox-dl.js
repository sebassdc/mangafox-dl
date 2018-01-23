#! /usr/bin/env node
const { log } = console
const { inspect } = require('util')
const logSymbols = require('log-symbols')
const program = require('commander')
const mangaFox = require('node-mangafox')
const chalk = require('chalk')
const gradient = require('gradient-string')
const fs = require('fs')
const { zipFolder } = require('../utils')
const {
  downloadChapter,
  multiDownload,
  downloadPage,
  downloadAll,
} = require('../')


const range = (val) => val.split('..').map(Number)


program
  .version('0.1.0')

// 'Search for mangas likely the query'
// program
//   .command('search <query>')

 // 'Get info of a manga given an id'
// program
//   .command('info <id>')

program
  .command('chapters <manga>')
  .description('Get the number of chapters of the manga')
  .action(manga => {
    mangaFox.getChapters(manga, num => {
      log(`${chalk.white.bold(manga)} have ${chalk.yellow.bold(num)} chapters`)
    })
  })

program
  .command('zip [folder]')
  .description('Turn the folder on a cbz file')
  .option('-A, --all', 'Zip all the folders on the working directory')
  .action((folder, opt)=> {
    if (folder) {
      zipFolder(folder)
        .then(() => log(`${logSymbols.success} Zipped ${gradient.rainbow(folder)}`))
        .catch(err => log(`${logSymbols} ${err}`))
    } else if (opt) {
      if (opt.all) {
        fs.readdir('./', (err, files) => {
          files
            .filter(e => fs.lstatSync(e).isDirectory)
            .forEach(folder => {
              zipFolder(folder)
                .then(() => log(`${logSymbols.success} Zipped ${gradient.rainbow(folder)}`))
                .catch(err => log(`${logSymbols} ${err}`))
            })
        })
      }
    }
  })

program
  .command('down <manga> [chapter] [page]')
  .description('Download a manga chapter or a range of chapters')
  .option('-r, --range <a>..<b>', 'Download from chapter <a> to chapter <b>', range)
  .action((manga, chapter, page, opt) => {

    if (opt.range) {
      multiDownload({
        manga,
        from: opt.range[0],
        to: opt.range[1],
      })
    } else if(page) {
      downloadPage(manga, chapter, page)
    } else if(chapter) {
      downloadChapter(manga, chapter)
        .run()
        .then(() => {
          log(gradient.rainbow("---Downloaded!---"))
        })
    } else {
      downloadAll({manga})
    }
  })


program
  .parse(process.argv)

