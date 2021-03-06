import axios from 'axios'
import chalk from 'chalk'
import mysql from 'mysql'

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

const catergories = ['pops', 'nico', 'toho', 'sega', 'game', 'orig']

function query(sql) {
  connection.query(sql, err => {
    if (err) {
      console.log(`${chalk.black.bgRed('ERROR')} ${sql}`)
      console.log(`${chalk.black.bgRed('ERROR')} ${err}`)
    } else {
      console.log(`${chalk.black.bgGreen('DONE')} Execution successful`)
    }
  })
  return 'DONE'
}

axios
  .get(
    'https://raw.githubusercontent.com/rayriffy/maimai-json/master/maimai.json',
  )
  .then(res => {
    const songs = res.data

    catergories.forEach(async category => {
      console.log(
        `${chalk.black.bgCyan('INFO')} Processing data for ${chalk.yellow(
          category.toUpperCase(),
        )}`,
      )

      console.log(
        `${chalk.black.bgYellow('WORKING')} Drop old tables for ${chalk.yellow(
          category.toUpperCase(),
        )}`,
      )
      await query('DROP TABLE `' + category + '`')

      console.log(
        `${chalk.black.bgYellow('WORKING')} Create new table for ${chalk.yellow(
          category.toUpperCase(),
        )}`,
      )
      await query(
        'CREATE TABLE `' +
          category +
          '` (`name_en` text COLLATE utf8mb4_unicode_ci NOT NULL,`name_jp` text COLLATE utf8mb4_unicode_ci NOT NULL,`artist_en` text COLLATE utf8mb4_unicode_ci NOT NULL,`artist_jp` text COLLATE utf8mb4_unicode_ci NOT NULL,`image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,`version` text COLLATE utf8mb4_unicode_ci NOT NULL,`bpm` int(11) NOT NULL,`level_easy` text COLLATE utf8mb4_unicode_ci NOT NULL,`level_basic` text COLLATE utf8mb4_unicode_ci NOT NULL,`level_advanced` text COLLATE utf8mb4_unicode_ci NOT NULL,`level_expert` text COLLATE utf8mb4_unicode_ci NOT NULL,`level_master` text COLLATE utf8mb4_unicode_ci NOT NULL,`level_remaster` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,`listen_youtube` text COLLATE utf8mb4_unicode_ci NOT NULL,`listen_niconico` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,`regionlocked` tinyint(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
      )

      console.log(
        `${chalk.black.bgYellow('WORKING')} Adding data for ${chalk.yellow(
          category.toUpperCase(),
        )}`,
      )
      songs[category].map(async song => {
        await connection.query(
          'INSERT INTO `' +
            category +
            '` (`name_en`, `name_jp`, `artist_en`, `artist_jp`, `image_url`, `version`, `bpm`, `level_easy`, `level_basic`, `level_advanced`, `level_expert`, `level_master`, `level_remaster`, `listen_youtube`, `listen_niconico`, `regionlocked`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            song.name.en,
            song.name.jp,
            song.artist.en,
            song.artist.jp,
            song.image_url,
            song.version,
            song.bpm,
            song.level.easy,
            song.level.basic,
            song.level.advanced,
            song.level.expert,
            song.level.master,
            song.level.remaster,
            song.listen.youtube,
            song.listen.niconico,
            song.regionlocked,
          ],
          err => {
            if (err) {
              console.log(`${chalk.black.bgRed('ERROR')} ${err}`)
            } else {
              console.log(`${chalk.black.bgGreen('DONE')} Execution successful`)
            }
          },
        )
      })
    })
  })
