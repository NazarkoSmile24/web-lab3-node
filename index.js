import { Command } from 'commander';

const program = new Command();

program
  .name('library-cli')
  .description('CLI-програма для роботи з бібліотечним каталогом')
  .version('1.0.0', '-V, --version', 'Показати версію програми')
  .helpOption('-h, --help', 'Показати довідку');

program.parse();