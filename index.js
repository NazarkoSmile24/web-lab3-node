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
    console.error(
      `Помилка: не вдалося прочитати або розібрати файл "${filePath}".`
    );
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
        console.error(
          'Помилка: значення --limit має бути додатним цілим числом.'
        );
        process.exit(1);
      }

      books = books.slice(0, limit);
    }

    books.forEach((book) => {
      console.log(
        `${book.id}. ${book.name} — ${book.authors.join(', ')}`
      );
    });
  });

program
  .command('show')
  .description('Показати одну книгу повністю')
  .argument('<id>', 'ID книги')
  .action((id) => {
    const data = readData();

    const book = data.booksForReading.find(
      (item) => item.id === id
    );

    if (!book) {
      console.error(
        `Помилка: книгу з ID "${id}" не знайдено.`
      );
      process.exit(1);
    }

    console.log(JSON.stringify(book, null, 2));
  });

program
  .command('field')
  .description('Показати значення окремого поля книги')
  .argument('<id>', 'ID книги')
  .argument(
    '<path>',
    'Шлях до поля, наприклад name або dateOfPublishing.part1'
  )
  .action((id, path) => {
    const data = readData();

    const book = data.booksForReading.find(
      (item) => item.id === id
    );

    if (!book) {
      console.error(
        `Помилка: книгу з ID "${id}" не знайдено.`
      );
      process.exit(1);
    }

    const parts = path.split('.');
    let value = book;

    for (const part of parts) {
      if (
        value !== null &&
        typeof value === 'object' &&
        part in value
      ) {
        value = value[part];
      } else {
        console.error(
          `Помилка: поле "${path}" не знайдено.`
        );
        process.exit(1);
      }
    }

    if (value === null) {
      console.log('null');
    } else if (typeof value === 'object') {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(value);
    }
  });

  program
  .command('author')
  .description('Знайти книги автора за частиною імені')
  .argument('<name>', 'Частина імені автора')
  .action((name) => {
    const data = readData();
    const search = name.toLowerCase();

    const books = data.booksForReading.filter((book) =>
      book.authors.some((author) =>
        author.toLowerCase().includes(search)
      )
    );

    if (books.length === 0) {
      console.error(
        `Помилка: книг автора за запитом "${name}" не знайдено.`
      );
      process.exit(1);
    }

    books.forEach((book) => {
      console.log(
        `${book.id}. ${book.name} — ${book.authors.join(', ')}`
      );
    });
  });

  program
  .command('copies')
  .description('Показати примірники вибраної книги')
  .argument('<id>', 'ID книги')
  .option('-a, --available', 'Показати лише доступні примірники')
  .action((id, options) => {
    const data = readData();

    const book = data.booksForReading.find(
      (item) => item.id === id
    );

    if (!book) {
      console.error(
        `Помилка: книгу з ID "${id}" не знайдено.`
      );
      process.exit(1);
    }

    let copies = book.copies;

    if (options.available) {
      copies = copies.filter((copy) => copy.available);
    }

    if (copies.length === 0) {
      console.log('Примірників, що відповідають умові, немає.');
      return;
    }

    copies.forEach((copy) => {
      console.log(
        `${copy.number} — ${copy.available ? 'доступний' : 'недоступний'}`
      );
    });
  });

  program
  .command('history')
  .description('Показати історію видач конкретного примірника')
  .argument('<number>', 'Номер примірника книги')
  .action((number) => {
    const data = readData();

    let foundCopy = null;
    let foundBook = null;

    for (const book of data.booksForReading) {
      const copy = book.copies.find(
        (item) => item.number === number
      );

      if (copy) {
        foundCopy = copy;
        foundBook = book;
        break;
      }
    }

    if (!foundCopy) {
      console.error(
        `Помилка: примірник з номером "${number}" не знайдено.`
      );
      process.exit(1);
    }

    console.log(`Книга: ${foundBook.name}`);
    console.log(`Примірник: ${foundCopy.number}`);

    if (foundCopy.loanHistory.length === 0) {
      console.log('Історія видач порожня.');
      return;
    }

    foundCopy.loanHistory.forEach((loan, index) => {
      console.log(`\nВидача ${index + 1}:`);
      console.log(`Читач: ${loan.borrowerName} ${loan.borrowerSurname}`);
      console.log(`ID читача: ${loan.borrowerId}`);
      console.log(`Дата видачі: ${loan.borrowDate}`);
      console.log(
        `Дата повернення: ${loan.returnDate === null ? 'ще не повернено' : loan.returnDate}`
      );
    });
  });

program.parse();