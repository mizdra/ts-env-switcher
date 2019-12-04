import chalk from 'chalk';
import { formatWithOptions } from 'util';

export function info(message: any) {
  console.log(`${chalk.green('info')}: ${message}`);
}

export function warning(message: any) {
  console.warn(`${chalk.yellow('warning')}: ${message}`);
}

export function error(message: any) {
  console.error(`${chalk.red('error')}: ${message}`);
}

export function debug(message: any) {
  console.debug(`${chalk.gray('debug')}: ${message}`);
}

export function format(obj: Object): string {
  return formatWithOptions({ colors: true }, '%O', obj);
}
