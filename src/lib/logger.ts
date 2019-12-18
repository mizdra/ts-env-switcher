import chalk from 'chalk';
import { formatWithOptions } from 'util';

let isDebugMode: boolean = false;

export function setDebugMode(newState: boolean) {
  isDebugMode = newState;
}

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
  if (isDebugMode) console.debug(`${chalk.gray('debug')}: ${message}`);
}

export function format(obj: Object): string {
  return formatWithOptions({ colors: true, maxArrayLength: null }, '%O', obj);
}
