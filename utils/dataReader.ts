import fs from 'fs';
import path from 'path';

export type TestData = {
  [key: string]: any;
};

export function readJsonData<T extends TestData>(fileName: string): T {
  const filePath = path.resolve(process.cwd(), 'test-data', fileName);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContents) as T;
}

export function getTestData<T extends TestData>(data: TestData, testName: string): T {
  return data[testName] as T;
}
