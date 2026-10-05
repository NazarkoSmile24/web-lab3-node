import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .name('library-cli')
  .description('CLI-програма для роботи з бібліотечним каталогом')
  .version('1.0.0', '-V, --version', 'Показати версію програми')
  .helpOption('-h, --help', 'Показати довідку')
  .option('-f, --file <path>', 'Шлях до JSON-файлу', 'data.json');

function readData() {
  const options = program.opts();
  const filePath = options.file;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Помилка: не вдалося прочитати або розібрати файл "${filePath}".`);
    process.exit(1);
  }
}

program
  .command('list')
  .description('Показати список книг')
  .option('-l, --limit <number>', 'Обмежити кількість книг')
  .action((options) => {
    const data = readData();
    let books = data.booksForReading;

    if (options.limit !== undefined) {
      const limit = Number(options.limit);

      if (!Number.isInteger(limit) || limit <= 0) {
        console.error('Помилка: значення --limit має бути додатним цілим числом.');
        process.exit(1);
      }

      books = books.slice(0, limit);
    }

    books.forEach((book) => {
      console.log(`${book.id}. ${book.name} — ${book.authors.join(', ')}`);
    });
  });

program.parse();