import type { FileReadStream } from 'async-busboy'

export type InputParameters = {
  files: [FileReadStream]
}
